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
  company?: {
    value: string;
    confidence: number;
  };
  ticketId?: {
    value: string;
    confidence: number;
  };
  submittedAt?: {
    value: Date;
    confidence: number;
  };
}

export interface FollowUpOptions {
  company: string;
  ticketId: string;
  daysOverdue: number;
  submittedAt: Date;
}

export interface ParsedField<T> {
  value: T;
  confidence: number;
}
