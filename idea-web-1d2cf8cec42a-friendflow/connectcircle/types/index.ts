export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  frequency: number; // days between check-ins
  lastContact: Date;
  notes?: string;
  relationship?: string;
  createdAt: Date;
}

export interface Interaction {
  id: string;
  contactId: string;
  date: Date;
  type: 'call' | 'text' | 'meetup' | 'other';
  notes?: string;
}
