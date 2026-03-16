import { Env, FormData, Submission } from '../types';

export async function saveForm(env: Env, formData: FormData): Promise<void> {
  const ttl = formData.expiresAt - Date.now();
  await env.FORMS_KV.put(
    `form:${formData.id}`,
    JSON.stringify(formData),
    { expirationTtl: Math.floor(ttl / 1000) }
  );
}

export async function getForm(env: Env, id: string): Promise<FormData | null> {
  const data = await env.FORMS_KV.get(`form:${id}`);
  return data ? JSON.parse(data) : null;
}

export async function saveSubmission(env: Env, submission: Submission): Promise<void> {
  await env.FORMS_KV.put(
    `submission:${submission.formId}`,
    JSON.stringify(submission),
    { expirationTtl: 86400 } // 24 hours
  );
}

export async function getSubmission(env: Env, formId: string): Promise<Submission | null> {
  const data = await env.FORMS_KV.get(`submission:${formId}`);
  return data ? JSON.parse(data) : null;
}
