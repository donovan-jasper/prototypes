import axios from 'axios';
// import Constants from 'expo-constants'; // For environment variables in a real Expo app

class RaccoonAIService {
  // IMPORTANT: Replace 'YOUR_OPENAI_API_KEY' with your actual OpenAI API key.
  // For production, consider using environment variables (e.g., via `expo-constants` or a custom build config).
  static OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; 
  static OPENAI_CHAT_MODEL = 'gpt-3.5-turbo'; // Recommended for chat-like interactions and context
  static OPENAI_COMPLETION_MODEL = 'text-davinci-003'; // Original model for single completions, less ideal for context

  /**
   * Processes a single message or a series of messages using the OpenAI Chat API.
   * This function is designed to maintain conversational context.
   * @param {Array<object>} messages - An array of message objects [{ role: 'user'|'assistant'|'system', content: '...' }]
   * @returns {Promise<string>} A promise that resolves with the AI's response.
   */
  static async processChatMessages(messages) {
    if (!RaccoonAIService.OPENAI_API_KEY || RaccoonAIService.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
      console.error('OpenAI API key is not set. Please replace "YOUR_OPENAI_API_KEY" in RaccoonAIService.js');
      return 'Error: OpenAI API key is not configured. Please set it to enable AI features.';
    }

    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RaccoonAIService.OPENAI_API_KEY}`,
    };
    const data = {
      'model': RaccoonAIService.OPENAI_CHAT_MODEL,
      'messages': messages,
      'temperature': 0.7, // Controls randomness. Lower values for more focused/deterministic output.
      'max_tokens': 2048, // Maximum number of tokens to generate in the completion.
      'top_p': 1, // Controls diversity via nucleus sampling.
      'frequency_penalty': 0, // Penalizes new tokens based on their existing frequency in the text so far.
      'presence_penalty': 0, // Penalizes new tokens based on whether they appear in the text so far.
    };

    try {
      const response = await axios.post(url, data, { headers });
      const result = response.data.choices[0].message.content;
      return result;
    } catch (error) {
      console.error('Error processing chat messages with OpenAI:', error.response ? error.response.data : error.message);
      return `Error processing message. Please check your API key, network connection, or OpenAI status. Details: ${error.message}`;
    }
  }

  /**
   * Processes a single, standalone message using the OpenAI Completions API (legacy).
   * This is less ideal for conversational context but kept for original `processMessage` functionality.
   * @param {string} message - The user's message.
   * @returns {Promise<string>} A promise that resolves with the AI's response.
   */
  static async processMessage(message) {
    if (!RaccoonAIService.OPENAI_API_KEY || RaccoonAIService.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
      console.error('OpenAI API key is not set. Please replace "YOUR_OPENAI_API_KEY" in RaccoonAIService.js');
      return 'Error: OpenAI API key is not configured. Please set it to enable AI features.';
    }

    const url = 'https://api.openai.com/v1/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RaccoonAIService.OPENAI_API_KEY}`,
    };
    const data = {
      'model': RaccoonAIService.OPENAI_COMPLETION_MODEL,
      'prompt': message,
      'temperature': 0.7,
      'max_tokens': 2048,
      'top_p': 1,
      'frequency_penalty': 0,
      'presence_penalty': 0,
    };

    try {
      const response = await axios.post(url, data, { headers });
      const result = response.data.choices[0].text;
      return result;
    } catch (error) {
      console.error('Error processing message with OpenAI (legacy completions):', error.response ? error.response.data : error.message);
      return `Error processing message. Please check your API key, network connection, or OpenAI status. Details: ${error.message}`;
    }
  }

  /**
   * Execute a task chain by sending each task as a prompt to the OpenAI API,
   * maintaining context, and returning a comprehensive AI-generated summary.
   * @param {object} chain - The task chain object, including its name and tasks array.
   * @returns {Promise<string>} A promise that resolves with a comprehensive AI-generated summary or outcome.
   */
  static async executeTaskChain(chain) {
    console.log(`Initiating execution for task chain: "${chain.name}"`);
    console.log('Tasks to process:', chain.tasks);

    if (!chain.tasks || chain.tasks.length === 0) {
      return `Task chain "${chain.name}" has no tasks to execute.`;
    }

    // Initialize conversation history with a system message to set the AI's role
    // This system message guides the AI's behavior throughout the task chain.
    const conversationHistory = [
      {
        role: 'system',
        content: `You are RaccoonAI, an expert task execution agent. You will be given a series of tasks within a chain named "${chain.name}". Process each task sequentially, providing a concise and actionable response for each. Maintain context throughout the chain. After all tasks are done, you will be asked to provide a final summary.`,
      },
    ];

    const taskOutcomes = []; // To store individual task results for later summarization

    for (let i = 0; i < chain.tasks.length; i++) {
      const task = chain.tasks[i];
      console.log(`Processing task ${i + 1}/${chain.tasks.length}: "${task}"`);

      // Add the current task as a user message to the conversation history
      conversationHistory.push({
        role: 'user',
        content: `Task ${i + 1}: ${task}`,
      });

      try {
        // Send the entire conversation history to maintain context across tasks.
        // The AI sees all previous messages (system, user, assistant) to inform its current response.
        const aiResponse = await RaccoonAIService.processChatMessages(conversationHistory);
        console.log(`AI Response for task "${task}":`, aiResponse);

        // Add the AI's response to the conversation history as an assistant message.
        // This response will be part of the context for subsequent tasks.
        conversationHistory.push({
          role: 'assistant',
          content: aiResponse,
        });

        taskOutcomes.push({ task: task, response: aiResponse });

        // Small delay to simulate processing and be mindful of potential API rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing task "${task}":`, error);
        const errorMessage = `An error occurred while processing this task: ${error.message}`;
        taskOutcomes.push({ task: task, response: errorMessage });
        conversationHistory.push({
          role: 'assistant',
          content: errorMessage,
        });
        // Decide if you want to stop the chain on error or continue.
        // For this prototype, we'll continue but log the error and include it in outcomes.
      }
    }

    // After all tasks are processed, request a final comprehensive summary from the AI.
    // This final prompt also becomes part of the conversation history.
    const summaryPrompt = `All tasks in the chain named "${chain.name}" have been processed. Please provide a comprehensive, AI-generated summary of the entire task chain. Include the overall outcome, key results from each task, and any important insights or next steps. Format it clearly for a user.`;

    conversationHistory.push({
      role: 'user',
      content: summaryPrompt,
    });

    try {
      console.log('Generating final summary for the task chain...');
      const finalSummary = await RaccoonAIService.processChatMessages(conversationHistory);
      console.log('Final Task Chain Summary:', finalSummary);
      return finalSummary;
    } catch (error) {
      console.error('Error generating final summary:', error);
      // Fallback summary if the final AI call fails
      return `Task chain "${chain.name}" completed with some issues. Individual task outcomes: \n${taskOutcomes.map(o => `- ${o.task}: ${o.response}`).join('\n')}\nError generating final summary: ${error.message}`;
    }
  }

  /**
   * Placeholder for counting user-specific task chains.
   * This would typically query a backend database filtered by userId.
   * For local SQLite, we might count all chains or add a userId column if needed.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<number>} A promise that resolves with the count of task chains.
   */
  static async countUserTaskChains(userId) {
    console.log(`Counting task chains for user: ${userId}`);
    // In a real app, this would query a backend or local DB with a user filter.
    // For this prototype, we'll return a mock count or count from local DB if userId was stored.
    // Since our local DB doesn't have userId, we'll just return a mock value.
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const mockCount = Math.floor(Math.random() * 20) + 1; // Random count for demonstration
    console.log(`User ${userId} has ${mockCount} task chains.`);
    return mockCount;
  }
}

export default RaccoonAIService;
