import { Env } from '../types';
import { getForm } from '../utils/storage';
import { generateFormHTML } from '../templates/form.html';

export async function handleGetForm(formId: string, env: Env): Promise<Response> {
  const form = await getForm(env, formId);

  if (!form) {
    return new Response('Form not found or expired', { status: 404 });
  }

  if (form.submitted) {
    return new Response('Form already submitted', { status: 410 });
  }

  const html = generateFormHTML(form);
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
