export const brokerTypes = ['cfd', 'bond', 'stock', 'crypto'] as const;

export type BrokerType = (typeof brokerTypes)[number];

export type Broker = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website: string;
  broker_type: BrokerType;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
};
