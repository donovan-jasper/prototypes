import { Env } from './types';
import { validateApiKey } from './utils/auth';
import { handleCreateForm } from './handlers/createForm';
import { handleGetForm } from './handlers/getForm';
import { handleSubmitForm } from './handlers/submitForm';
import { handleGetSubmission } from './handlers/getSubmission';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API endpoints (require authentication)
    if (path.startsWith('/api/')) {
      if (!validateApiKey(request, env)) {
        return new Response('Unauthorized', { status: 401 });
      }

      if (path === '/api/forms' && request.method === 'POST') {
        const response = await handleCreateForm(request, env);
        Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
        return response;
      }

      const submissionMatch = path.match(/^\/api\/submissions\/([a-f0-9-]+)$/);
      if (submissionMatch && request.method === 'GET') {
        const response = await handleGetSubmission(submissionMatch[1], env);
        Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
        return response;
      }
    }

    // Public form endpoints
    const formMatch = path.match(/^\/forms\/([a-f0-9-]+)$/);
    if (formMatch && request.method === 'GET') {
      return handleGetForm(formMatch[1], env);
    }

    const submitMatch = path.match(/^\/forms\/([a-f0-9-]+)\/submit$/);
    if (submitMatch && request.method === 'POST') {
      return handleSubmitForm(submitMatch[1], request, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};
