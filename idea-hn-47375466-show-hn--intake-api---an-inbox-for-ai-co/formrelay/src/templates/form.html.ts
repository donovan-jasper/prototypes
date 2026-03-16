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
