# Intake API Implementation Spec

## 1. App Name

**FormRelay**

## 2. One-line pitch

A Cloudflare Worker API that generates pre-filled web forms from AI agents, allowing humans to review and submit structured data without copy-pasting between terminals and browsers.

## 3. Tech stack

- **Runtime**: Cloudflare Workers (JavaScript/TypeScript)
- **Storage**: Cloudflare KV (key-value store for form state)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **API**: REST endpoints with JSON responses
- **Authentication**: Simple API key validation

## 4. Core features

1. **Create Form API** - AI agents POST structured data to generate a unique form URL with pre-filled fields
2. **Human Form View** - Clean web interface displaying pre-filled data with edit capabilities and submit button
3. **Retrieve Submission API** - AI agents poll or fetch completed form data after human submission
4. **Temporary Storage** - Forms expire after 24 hours or upon submission to prevent data accumulation
5. **File Upload Support** - Allow humans to attach files (images, documents) that agents can retrieve

## 5. File structure

```
formrelay/
├── src/
│   ├── index.ts                 # Main Worker entry point
│   ├── handlers/
│   │   ├── createForm.ts        # POST /api/forms
│   │   ├── getForm.ts           # GET /forms/:id
│   │   ├── submitForm.ts        # POST /forms/:id/submit
│   │   └── getSubmission.ts     # GET /api/submissions/:id
│   ├── templates/
│   │   └── form.html.ts         # HTML template generator
│   ├── utils/
│   │   ├── auth.ts              # API key validation
│   │   ├── storage.ts           # KV operations wrapper
│   │   └── validation.ts        # Input validation
│   └── types.ts                 # TypeScript interfaces
├── wrangler.toml                # Cloudflare Workers config
├── package.json
└── README.md
```

## 6. Implementation steps

### Step 1: Initialize Cloudflare Workers project

```bash
npm create cloudflare@latest formrelay
# Select "Hello World" Worker template
cd formrelay
npm install
```

### Step 2: Configure wrangler.toml

Add KV namespace binding:

```toml
name = "formrelay"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "FORMS_KV"
id = "your_kv_namespace_id"

[vars]
API_KEY = "your-secret-api-key-here"
FORM_EXPIRY_HOURS = "24"
```

### Step 3: Define TypeScript types (src/types.ts)

```typescript
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
```

### Step 4: Create utility functions

**src/utils/auth.ts**

```typescript
import { Env } from '../types';

export function validateApiKey(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return token === env.API_KEY;
}
```

**src/utils/storage.ts**

```typescript
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
```

**src/utils/validation.ts**

```typescript
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
```

### Step 5: Create form HTML template (src/templates/form.html.ts)

```typescript
import { FormData } from '../types';

export function generateFormHTML(form: FormData): string {
  const fieldsHTML = form.fields.map(field => {
    const requiredAttr = field.required ? 'required' : '';
    const requiredLabel = field.required ? '<span style="color: red;">*</span>' : '';

    switch (field.type) {
      case 'textarea':
        return `
          <div class="field">
            <label>${field.label}${requiredLabel}</label>
            <textarea name="${field.name}" ${requiredAttr}>${field.value || ''}</textarea>
          </div>
        `;
      case 'select':
        const options = field.options?.map(opt => 
          `<option value="${opt}" ${opt === field.value ? 'selected' : ''}>${opt}</option>`
        ).join('');
        return `
          <div class="field">
            <label>${field.label}${requiredLabel}</label>
            <select name="${field.name}" ${requiredAttr}>
              <option value="">-- Select --</option>
              ${options}
            </select>
          </div>
        `;
      case 'file':
        return `
          <div class="field">
            <label>${field.label}${requiredLabel}</label>
            <input type="file" name="${field.name}" ${requiredAttr} />
          </div>
        `;
      default:
        return `
          <div class="field">
            <label>${field.label}${requiredLabel}</label>
            <input type="${field.type}" name="${field.name}" value="${field.value || ''}" ${requiredAttr} />
          </div>
        `;
    }
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${form.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { font-size: 24px; margin-bottom: 8px; color: #333; }
    .description { color: #666; margin-bottom: 32px; line-height: 1.5; }
    .field { margin-bottom: 24px; }
    label { display: block; font-weight: 500; margin-bottom: 8px; color: #333; }
    input, textarea, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: inherit; }
    textarea { min-height: 100px; resize: vertical; }
    button { background: #0066cc; color: white; border: none; padding: 12px 24px; border-radius: 4px; font-size: 16px; font-weight: 500; cursor: pointer; width: 100%; }
    button:hover { background: #0052a3; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .success { background: #d4edda; color: #155724; padding: 16px; border-radius: 4px; margin-bottom: 20px; }
    .error { background: #f8d7da; color: #721c24; padding: 16px; border-radius: 4px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${form.title}</h1>
    ${form.description ? `<p class="description">${form.description}</p>` : ''}
    <div id="message"></div>
    <form id="mainForm">
      ${fieldsHTML}
      <button type="submit">Submit</button>
    </form>
  </div>
  <script>
    const form = document.getElementById('mainForm');
    const message = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {};
      const files = {};

      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          if (value.size > 0) {
            const reader = new FileReader();
            const base64 = await new Promise((resolve) => {
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(value);
            });
            files[key] = base64;
          }
        } else {
          data[key] = value;
        }
      }

      try {
        const response = await fetch(window.location.pathname + '/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, files })
        });

        if (response.ok) {
          message.innerHTML = '<div class="success">Form submitted successfully!</div>';
          form.style.display = 'none';
        } else {
          const error = await response.text();
          message.innerHTML = '<div class="error">Error: ' + error + '</div>';
        }
      } catch (err) {
        message.innerHTML = '<div class="error">Network error. Please try again.</div>';
      }
    });
  </script>
</body>
</html>
  `;
}
```

### Step 6: Implement API handlers

**src/handlers/createForm.ts**

```typescript
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
```

**src/handlers/getForm.ts**

```typescript
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
```

**src/handlers/submitForm.ts**

```typescript
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
```

**src/handlers/getSubmission.ts**

```typescript
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
```

### Step 7: Create main Worker entry point (src/index.ts)

```typescript
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
```

### Step 8: Create KV namespace

```bash
npx wrangler kv:namespace create "FORMS_KV"
# Copy the ID from output and update wrangler.toml
```

### Step 9: Deploy to Cloudflare Workers

```bash
npm run deploy
```

## 7. How to test it works

### Test 1: Create a form (AI agent perspective)

```bash
curl -X POST https://your-worker.workers.dev/api/forms \
  -H "Authorization: Bearer your-secret-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project Requirements",
    "description": "Please review and complete the following information",
    "fields": [
      {
        "name": "project_name",
        "label": "Project Name",
        "type": "text",
        "value": "My Awesome App",
        "required": true
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "value": "A tool that does amazing things"
      },
      {
        "name": "priority",
        "label": "Priority",
        "type": "select",
        "options": ["Low", "Medium", "High"],
        "value": "High",
        "required": true
      }
    ]
  }'
```

Expected response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://your-worker.workers.dev/forms/550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": 1710662961616
}
```

### Test 2: View and submit form (human perspective)

1. Open the URL from the response in a browser
2. Verify pre-filled values appear correctly
3. Modify any fields as needed
4. Click Submit
5. Verify success message appears

### Test 3: Retrieve submission (AI agent perspective)

```bash
curl https://your-worker.workers.dev/api/submissions/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer your-secret-api-key-here"
```

Expected response:
```json
{
  "submitted": true,
  "data": {
    "project_name": "My Awesome App (Updated)",
    "description": "A tool that does amazing things with extra details",
    "priority": "High"
  },
  "files": {},
  "submittedAt": 1710576561616
}
```

### Test 4: File upload

Create a form with a file field, upload an image through the web interface, then retrieve the submission to verify the base64-encoded file is included in the response.