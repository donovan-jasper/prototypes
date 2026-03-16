export interface Order {
  id: number;
  restaurant: string;
  menuLink: string;
  deadline: string;
  status: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  participants?: Participant[];
  items?: CartItem[];
}

export interface Group {
  id: number;
  name: string;
  members?: GroupMember[];
}

export interface GroupMember {
  id: number;
  groupId: number;
  name: string;
}

export interface Participant {
  id: number;
  orderId: number;
  name: string;
}

export interface CartItem {
  id: number;
  orderId: number;
  participantId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Payment {
  id: number;
  orderId: number;
  participantId: number;
  amount: number;
  status: string;
}

export interface User {
  id: number;
  name: string;
  phone: string;
}

export interface Subscription {
  isPro: boolean;
  orderCount: number;
}
