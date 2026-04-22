import { ParsedCommand } from '../types'; // Import ParsedCommand type

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
          content: `Parse voice commands into structured actions. Return JSON with the following structure:
            {
              "type": "message" | "task" | "query" | "status_update" | "unknown",
              "content": "string", // The main text of the command
              "target"?: "string", // Optional: For queries, who or what is being queried (e.g., "Sarah", "the delivery schedule")
              "dueDate"?: number // Optional: Unix timestamp for tasks (e.g., for "tomorrow", "next week")
            }
            Examples:
            - "Tell John I'll be late": { "type": "message", "content": "I'll be late" }
            - "Add task to check electrical panel tomorrow": { "type": "task", "content": "check electrical panel", "dueDate": ${Math.floor(Date.now() / 1000) + 86400} }
            - "What did Sarah say about the delivery?": { "type": "query", "content": "What did Sarah say about the delivery?", "target": "Sarah" }
            - "Status update: finished north wall framing": { "type": "status_update", "content": "finished north wall framing" }
            - "Just saying hi": { "type": "message", "content": "Just saying hi" }
            If intent is unclear, default to 'message' or 'unknown'. Ensure all responses are valid JSON.`
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
  if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
    try {
      return JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("Failed to parse AI response JSON:", e);
      return { type: 'unknown', content: text }; // Fallback
    }
  }
  return { type: 'unknown', content: text }; // Fallback
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
          content: 'You are a helpful assistant for field workers. Answer questions based on conversation history and task data. Be concise and direct.'
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
