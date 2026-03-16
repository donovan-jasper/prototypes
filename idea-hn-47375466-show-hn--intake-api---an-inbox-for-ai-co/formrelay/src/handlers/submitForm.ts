import { Env, Submission } from '../types';
import { getForm, saveSubmission, saveForm } from '../utils/storage';

export async function handleSubmitForm(formId: string, request: Request, env: Env): Promise<Response> {
  const form = await getForm(env, formId);

  if (!form) {
    return new Response('Form not found or expired', { status: 404 });
  }

  if (form.submitted) {
    return new Response('Form already submitted', { status: 410 });
  }

  try {
    const body = await request.json();
    const { data, files } = body;

    const submission: Submission = {
      formId,
      data,
      files: files || {},
      submittedAt: Date.now()
    };

    await saveSubmission(env, submission);

    form.submitted = true;
    await saveForm(env, form);

    return new Response('Submitted', { status: 200 });
  } catch (error: any) {
    return new Response(error.message, { status: 400 });
  }
}
