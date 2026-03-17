export interface Hangout {
  id: string;
  title: string;
  hobby: string;
  distance: number; // in miles
  startTime: Date;
  attendees: number;
  maxAttendees: number;
}

export interface User {
  id: string;
  name: string;
  trustScore: number;
  premiumStatus: boolean;
  hobbies: string[];
  location: {
    latitude: number;
    longitude: number;
  };
}

// Placeholder for other types as they are implemented
// export interface Hobby { ... }
// export interface LocationData { ... }
// export interface NotificationSettings { ... }
