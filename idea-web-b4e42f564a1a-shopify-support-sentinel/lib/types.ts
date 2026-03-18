export interface Ticket {
  id: number;
  company: string;
  ticketId: string;
  description: string;
  status: 'active' | 'resolved' | 'snoozed';
  submittedAt: Date;
  expectedResponseHours: number;
  resolvedAt?: Date;
  notes?: string;
}

export interface ParsedTicket {
  company?: string;
  ticketId?: string;
  submittedAt?: Date;
}

export interface CreateTicketInput {
  company: string;
  ticketId: string;
  description: string;
  submittedAt: Date;
  expectedResponseHours: number;
  notes?: string;
}

export interface UpdateTicketInput {
  company?: string;
  ticketId?: string;
  description?: string;
  status?: 'active' | 'resolved' | 'snoozed';
  expectedResponseHours?: number;
  resolvedAt?: Date;
  notes?: string;
}
