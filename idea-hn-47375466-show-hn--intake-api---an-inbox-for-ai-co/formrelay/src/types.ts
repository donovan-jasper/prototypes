export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'number' | 'file' | 'select';
  value?: string;
  required?: boolean;
  options?: string[]; // For select fields
}

export interface FormData {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: number;
  expiresAt: number;
  submitted: boolean;
}

export interface Submission {
  formId: string;
  data: Record<string, any>;
  files?: Record<string, string>; // filename -> base64
  submittedAt: number;
}

export interface Env {
  FORMS_KV: KVNamespace;
  API_KEY: string;
  FORM_EXPIRY_HOURS: string;
}
