import { PrismaClient, BrokerType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 12);

  await prisma.user.upsert({
    where: { email: 'demo@woxa.test' },
    update: {},
    create: {
      full_name: 'Demo Woxa',
      email: 'demo@woxa.test',
      password,
    },
  });

  await prisma.broker.createMany({
    data: [
      {
        name: 'Exness Broker',
        slug: 'exness-broker',
        description: 'CFD broker platform for institutional liquidity access and multi-asset execution.',
        logo_url: 'https://placehold.co/160x160/1d4ed8/ffffff/png?text=EX',
        website: 'https://www.exness.com',
        broker_type: BrokerType.cfd,
      },
      {
        name: 'Vanguard Capital',
        slug: 'vanguard-capital',
        description: 'Specializing in high-frequency CFD execution and multi-asset liquidity across Asian markets.',
        logo_url: 'https://placehold.co/160x160/111827/ffffff/png?text=VC',
        website: 'https://www.exness.com',
        broker_type: BrokerType.cfd,
      },
      {
        name: 'Meridian Bonds',
        slug: 'meridian-bonds',
        description: 'The global authority on sovereign debt and corporate bond indexing for institutional portfolios.',
        logo_url: 'https://placehold.co/160x160/1e3a8a/ffffff/png?text=MB',
        website: 'https://www.bondconnect.com',
        broker_type: BrokerType.bond,
      },
      {
        name: 'Apex Equities',
        slug: 'apex-equities',
        description: 'Direct market access to NYSE and LSE with industry-leading low-latency execution frameworks.',
        logo_url: 'https://placehold.co/160x160/334155/ffffff/png?text=AE',
        website: 'https://www.interactivebrokers.com',
        broker_type: BrokerType.stock,
      },
      {
        name: 'BlockStream Prime',
        slug: 'blockstream-prime',
        description: 'Secure digital asset brokerage bridging traditional finance with decentralized liquidity pools.',
        logo_url: 'https://placehold.co/160x160/0f766e/ffffff/png?text=BP',
        website: 'https://www.binance.com',
        broker_type: BrokerType.crypto,
      },
      {
        name: 'Summit Analytics',
        slug: 'summit-analytics',
        description: 'Data-driven brokerage services focused on commodities and precious metals trading desks.',
        logo_url: 'https://placehold.co/160x160/1e3a8a/ffffff/png?text=SA',
        website: 'https://www.summit-analytics.test',
        broker_type: BrokerType.cfd,
      }
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
