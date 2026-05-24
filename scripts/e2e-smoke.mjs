import { existsSync, readdirSync, readFileSync } from 'node:fs';

const API_URL = process.env.API_URL ?? 'http://localhost:4000/api';
const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000';
const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://woxa:woxa_password@localhost:15432/woxa_brokers?schema=public';

const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const email = `smoke-${runId}@woxa.test`;
const mismatchEmail = `mismatch-${runId}@woxa.test`;
const password = 'password123';
const slug = `smoke-broker-${runId}`.toLowerCase();

const brokerPayload = {
  name: `Smoke Broker ${runId}`,
  slug,
  description: 'Automated smoke test broker used to verify the full stack workflow.',
  logo_url: 'https://placehold.co/160x160/111827/ffffff/png?text=ST',
  website: 'https://example.com',
  broker_type: 'stock',
};

function log(message) {
  console.log(`OK ${message}`);
}

function fail(message) {
  throw new Error(message);
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return { response, data };
}

async function assertStatus(url, expectedStatus = 200) {
  const response = await fetch(url);
  if (response.status !== expectedStatus) {
    fail(`${url} returned ${response.status}, expected ${expectedStatus}`);
  }
  return response;
}

function decodeJwtPayload(token) {
  const [, payload] = token.split('.');
  if (!payload) {
    fail('JWT token is not in compact format');
  }

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
}

function assertReadmeAndProjectFiles() {
  const requiredFiles = ['README.md', '.env.example', 'docker-compose.yml'];
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      fail(`${file} is missing`);
    }
  }

  const envExample = readFileSync('.env.example', 'utf8');
  for (const key of ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL', 'NEXT_PUBLIC_API_URL', 'INTERNAL_API_URL']) {
    if (!envExample.includes(key)) {
      fail(`.env.example is missing ${key}`);
    }
  }

  const compose = readFileSync('docker-compose.yml', 'utf8');
  for (const service of ['postgres:', 'api:', 'web:']) {
    if (!compose.includes(service)) {
      fail(`docker-compose.yml is missing ${service}`);
    }
  }

  const migrationDir = 'apps/api/prisma/migrations';
  if (!existsSync(migrationDir) || readdirSync(migrationDir).length === 0) {
    fail('Prisma migration directory is missing or empty');
  }

  const readme = readFileSync('README.md', 'utf8');
  for (const phrase of ['Run With Docker', 'Run Prisma migrations', 'Seed demo data', 'Manual Test Cases']) {
    if (!readme.includes(phrase)) {
      fail(`README.md is missing "${phrase}"`);
    }
  }
}

async function cleanup() {
  try {
    process.env.DATABASE_URL = DATABASE_URL;
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.broker.deleteMany({ where: { slug } });
    await prisma.user.deleteMany({ where: { email: { in: [email, mismatchEmail] } } });
    await prisma.$disconnect();
    log('Cleaned up smoke test records');
  } catch (error) {
    console.warn(`Cleanup skipped: ${error.message}`);
  }
}

async function main() {
  try {
    await assertStatus(`${WEB_URL}/`);
    await assertStatus(`${WEB_URL}/login`);
    await assertStatus(`${WEB_URL}/register`);
    log('Frontend routes respond');

    const mismatchRegister = await request('/register', {
      method: 'POST',
      body: {
        fullName: 'Mismatch User',
        email: mismatchEmail,
        password,
        confirmPassword: 'different-password',
      },
    });
    if (mismatchRegister.response.status !== 400) {
      fail(`Password mismatch register returned ${mismatchRegister.response.status}, expected 400`);
    }
    log('Register API rejects password mismatch');

    const register = await request('/register', {
      method: 'POST',
      body: {
        fullName: 'Smoke Test User',
        email,
        password,
        confirmPassword: password,
      },
    });
    if (register.response.status !== 201) {
      fail(`Register returned ${register.response.status}`);
    }
    if (register.data?.message !== 'Register successful') {
      fail('Register did not return success message');
    }
    if (register.data?.user?.email !== email) {
      fail('Register did not return the created user');
    }
    if (register.data?.user?.password) {
      fail('Register response leaked password');
    }
    log('Register API works');

    const duplicateRegister = await request('/register', {
      method: 'POST',
      body: {
        fullName: 'Duplicate User',
        email,
        password,
        confirmPassword: password,
      },
    });
    if (duplicateRegister.response.status !== 409) {
      fail(`Duplicate register returned ${duplicateRegister.response.status}, expected 409`);
    }
    log('Register API rejects duplicate email');

    const login = await request('/login', {
      method: 'POST',
      body: { email, password },
    });
    if (login.response.status !== 201) {
      fail(`Login returned ${login.response.status}`);
    }
    const token = login.data?.accessToken;
    if (!token) {
      fail('Login did not return an access token');
    }
    if (login.data?.user?.password) {
      fail('Login response leaked password');
    }
    const jwtPayload = decodeJwtPayload(token);
    const allowedJwtKeys = new Set(['sub', 'email', 'fullName', 'iat', 'exp']);
    for (const key of Object.keys(jwtPayload)) {
      if (!allowedJwtKeys.has(key)) {
        fail(`JWT payload contains unexpected key: ${key}`);
      }
    }
    if (!jwtPayload.sub || jwtPayload.email !== email || !jwtPayload.fullName || jwtPayload.password) {
      fail('JWT payload is missing expected compact user data or leaked password');
    }
    log('Login API returns compact JWT');

    const failedLogin = await request('/login', {
      method: 'POST',
      body: { email, password: 'wrong-password' },
    });
    if (failedLogin.response.status !== 401) {
      fail(`Failed login returned ${failedLogin.response.status}, expected 401`);
    }
    log('Login API rejects invalid credentials');

    const unauthorizedCreate = await request('/brokers', {
      method: 'POST',
      body: brokerPayload,
    });
    if (unauthorizedCreate.response.status !== 401) {
      fail(`Unauthorized broker create returned ${unauthorizedCreate.response.status}, expected 401`);
    }
    log('Broker create endpoint rejects missing token');

    const invalidTokenCreate = await request('/brokers', {
      method: 'POST',
      token: 'invalid.jwt.token',
      body: brokerPayload,
    });
    if (invalidTokenCreate.response.status !== 401) {
      fail(`Invalid-token broker create returned ${invalidTokenCreate.response.status}, expected 401`);
    }
    log('Broker create endpoint rejects invalid token');

    const created = await request('/brokers', {
      method: 'POST',
      token,
      body: brokerPayload,
    });
    if (created.response.status !== 201) {
      fail(`Authorized broker create returned ${created.response.status}`);
    }
    if (created.data?.message !== 'Broker created successfully') {
      fail('Broker create did not return success message');
    }
    if (created.data?.broker?.slug !== slug) {
      fail('Created broker response has unexpected slug');
    }
    log('Protected broker create works');

    const duplicateBroker = await request('/brokers', {
      method: 'POST',
      token,
      body: brokerPayload,
    });
    if (duplicateBroker.response.status !== 409) {
      fail(`Duplicate broker slug returned ${duplicateBroker.response.status}, expected 409`);
    }
    log('Broker create rejects duplicate slug');

    const invalidTypeBroker = await request('/brokers', {
      method: 'POST',
      token,
      body: { ...brokerPayload, slug: `${slug}-bad-type`, broker_type: 'forex' },
    });
    if (invalidTypeBroker.response.status !== 400) {
      fail(`Invalid broker_type returned ${invalidTypeBroker.response.status}, expected 400`);
    }
    log('Broker create rejects invalid broker_type');

    const invalidUrlBroker = await request('/brokers', {
      method: 'POST',
      token,
      body: { ...brokerPayload, slug: `${slug}-bad-url`, logo_url: 'not-a-url' },
    });
    if (invalidUrlBroker.response.status !== 400) {
      fail(`Invalid URL returned ${invalidUrlBroker.response.status}, expected 400`);
    }
    log('Broker create rejects invalid URL');

    const list = await request(`/brokers?search=${encodeURIComponent(brokerPayload.name)}&type=stock`);
    if (list.response.status !== 200 || !Array.isArray(list.data?.data)) {
      fail('Broker list did not return { data: [] }');
    }
    if (!list.data.data.some((broker) => broker.slug === slug)) {
      fail('Search/filter did not return the created broker');
    }
    log('Search and filter work');

    const exnessSearch = await request('/brokers?search=exness');
    if (!exnessSearch.data?.data?.some((broker) => broker.slug === 'exness-broker')) {
      fail('Search for exness did not return Exness Broker');
    }
    log('Search by exness works');

    const cfdFilter = await request('/brokers?type=cfd');
    if (!Array.isArray(cfdFilter.data?.data) || cfdFilter.data.data.length === 0) {
      fail('CFD filter did not return any brokers');
    }
    if (!cfdFilter.data.data.every((broker) => broker.broker_type === 'cfd')) {
      fail('CFD filter returned a non-CFD broker');
    }
    log('Filter by cfd works');

    const combinedFilter = await request('/brokers?search=ex&type=cfd');
    if (!combinedFilter.data?.data?.some((broker) => broker.slug === 'exness-broker')) {
      fail('Combined search/type filter did not return Exness Broker');
    }
    if (!combinedFilter.data.data.every((broker) => broker.broker_type === 'cfd')) {
      fail('Combined search/type filter returned a non-CFD broker');
    }
    log('Combined search and type filter works');

    const detail = await request(`/brokers/${slug}`);
    if (detail.response.status !== 200 || detail.data?.slug !== slug) {
      fail('Broker detail did not return the created broker');
    }
    log('Broker detail API works');

    await assertStatus(`${WEB_URL}/broker/${slug}`);
    log('Broker detail page responds');

    const exnessPage = await assertStatus(`${WEB_URL}/broker/exness-broker`);
    const exnessHtml = await exnessPage.text();
    if (!exnessHtml.includes('Exness Broker') || !exnessHtml.includes('exness-broker')) {
      fail('Exness detail page did not render the expected broker data');
    }
    if (
      !exnessHtml.includes('Exness Broker | Woxa Broker Directory') ||
      !exnessHtml.includes('CFD broker platform for institutional liquidity access')
    ) {
      fail('Exness detail page metadata did not include dynamic title/description');
    }
    log('Broker detail page and metadata work');

    await assertStatus(`${WEB_URL}/broker/does-not-exist-${runId}`, 404);
    const missingDetail = await request(`/brokers/does-not-exist-${runId}`);
    if (missingDetail.response.status !== 404) {
      fail(`Missing broker API returned ${missingDetail.response.status}, expected 404`);
    }
    log('Missing broker returns not found');

    assertReadmeAndProjectFiles();
    log('README, env example, Docker Compose, migration, and seed docs are present');
  } finally {
    await cleanup();
  }
}

main()
  .then(() => {
    console.log('\nSmoke test passed.');
  })
  .catch((error) => {
    console.error(`\nSmoke test failed: ${error.message}`);
    process.exit(1);
  });
