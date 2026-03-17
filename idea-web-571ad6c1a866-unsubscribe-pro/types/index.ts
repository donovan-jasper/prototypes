export interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  headers: Record<string, string>;
  body: string;
  category?: 'important' | 'promotional' | 'spam' | 'subscription';
  tags?: string[];
}

export interface Sender {
  id: string;
  name: string;
  domain: string;
  emailCount: number;
  lastEmailDate: string;
  category?: 'important' | 'promotional' | 'spam' | 'subscription';
  tags?: string[];
}
