export interface Event {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  geohash: string;
  date: string;
  createdAt: any;
  updatedAt: any;
  participants: string[];
  distance?: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
