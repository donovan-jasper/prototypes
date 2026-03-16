import { FormField } from '../types';

export function validateFormFields(fields: any[]): FormField[] {
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error('Fields must be a non-empty array');
  }

  return fields.map(field => {
    if (!field.name || !field.label || !field.type) {
      throw new Error('Each field must have name, label, and type');
    }

    const validTypes = ['text', 'textarea', 'email', 'number', 'file', 'select'];
    if (!validTypes.includes(field.type)) {
      throw new Error(`Invalid field type: ${field.type}`);
    }

    return {
      name: field.name,
      label: field.label,
      type: field.type,
      value: field.value || '',
      required: field.required || false,
      options: field.options || []
    };
  });
}
