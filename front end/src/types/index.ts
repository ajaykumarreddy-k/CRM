export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  channel: string;
}

export interface Segment {
  id: string;
  name: string;
  rules: any[];
  count: number;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  segment: string;
  status: string;
  sent: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sales: number;
  revenue: number;
  description: string;
}
