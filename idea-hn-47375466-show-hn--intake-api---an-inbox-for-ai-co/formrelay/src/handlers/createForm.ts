import { Env, FormData } from '../types';
import { validateFormFields } from '../utils/validation';
import { saveForm } from '../utils/storage';

export async function handleCreateForm(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const { title, description, fields } = body;

    if (!title || !fields) {
      return new Response('Missing required fields: title, fields', { status: 400 });
    }

    const validatedFields = validateFormFields(fields);
    const id = crypto.randomUUID();
    const expiryHours = parseInt(env.FORM_EXPIRY_HOURS || '24');
    const now = Date.now();

    const formData: FormData = {
      id,
      title,
      description,
      fields: validatedFields,
      createdAt: now,
      expiresAt: now + (expiryHours * 60 * 60 * 1000),
      submitted: false
    };

    await saveForm(env, formData);

    return new Response(JSON.stringify({
      id,
      url: `${new URL(request.url).origin}/forms/${id}`,
      expiresAt: formData.expiresAt
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(error.message, { status: 400 });
  }
}
