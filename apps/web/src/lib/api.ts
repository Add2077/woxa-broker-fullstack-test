import { Broker, BrokerType, User } from '@/types/broker';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type CreateBrokerPayload = {
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website: string;
  broker_type: BrokerType;
};

type BrokerListParams = {
  search?: string;
  type?: BrokerType | '';
};

type AuthResponse = {
  accessToken: string;
  user: User;
};

type RegisterResponse = {
  message: string;
  user: User;
};

type CreateBrokerResponse = {
  message: string;
  broker: Broker;
};

type BrokerListResponse = {
  data: Broker[];
};

export function getApiUrl() {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
  }

  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
}

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    let payload: ApiErrorPayload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    const message = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message ?? payload.error ?? 'Request failed';
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createBroker(payload: CreateBrokerPayload, token: string) {
  return apiRequest<CreateBrokerResponse>(
    '/brokers',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  );
}

export function getBrokers(params: BrokerListParams) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.type) query.set('type', params.type);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<BrokerListResponse>(`/brokers${suffix}`).then((response) => response.data);
}

export async function getBroker(slug: string) {
  return apiRequest<Broker>(`/brokers/${slug}`);
}
