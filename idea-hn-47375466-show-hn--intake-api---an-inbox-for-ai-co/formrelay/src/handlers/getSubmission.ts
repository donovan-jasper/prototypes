import { Env } from '../types';
import { getSubmission } from '../utils/storage';

export async function handleGetSubmission(formId: string, env: Env): Promise<Response> {
  const submission = await getSubmission(env, formId);

  if (!submission) {
    return new Response(JSON.stringify({ submitted: false }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    submitted: true,
    data: submission.data,
    files: submission.files,
    submittedAt: submission.submittedAt
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
