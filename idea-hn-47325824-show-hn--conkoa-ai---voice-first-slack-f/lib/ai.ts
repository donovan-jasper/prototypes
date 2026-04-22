import { ParsedCommand } from '../types';

export async function parseVoiceCommand(text: string): Promise<ParsedCommand> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Parse voice commands into structured actions. Return JSON with:
          - type: 'task'|'message'|'query'|'status_update'
          - content: main content of the command (e.g., task title, message text, query text, status update text)
          - details: additional descriptive information, especially for tasks (optional)
          - dueDate: ISO date string if a due date is mentioned for a task (optional)
          - target: recipient for messages or specific entity for queries (optional)

          For task creation, extract the main action for 'content' and any additional description for 'details', and a 'dueDate' if specified. For example:
          "Remind me to check the electrical panel tomorrow, it's making a strange noise" should return:
          {
            type: 'task',
            content: 'Check electrical panel',
            details: 'It\'s making a strange noise',
            dueDate: '${new Date(Date.now() + 86400000).toISOString()}' // Example for tomorrow
          }
          For a message: "Tell Sarah that the north wall is finished"
          {
            type: 'message',
            content: 'The north wall is finished',
            target: 'Sarah'
          }
          For a query: "What did John say about the delivery?"
          {
            type: 'query',
            content: 'What did John say about the delivery?',
            target: 'John'
          }
          For a status update: "Status update: finished framing"
          {
            type: 'status_update',
            content: 'finished framing'
          }
          `
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' }
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

export async function generateResponse(query: string, context: any[]) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for field workers. Answer questions based on conversation history and task data.'
        },
        {
          role: 'user',
          content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${query}`
        }
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
