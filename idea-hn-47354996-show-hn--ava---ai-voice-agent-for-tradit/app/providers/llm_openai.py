from openai import AsyncOpenAI

class OpenAILLM:
    def __init__(self, api_key: str, model: str = "gpt-4", system_prompt: str = ""):
        if not api_key:
            raise ValueError("OpenAI API key is required for LLM.")
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
        self.system_prompt = system_prompt
        self.conversation_history = []
    
    def reset_conversation(self):
        self.conversation_history = []
    
    async def generate_response(self, user_input: str) -> str:
        """Generate response using GPT"""
        messages = []
        if self.system_prompt:
            messages.append({"role": "system", "content": self.system_prompt})
        
        messages.extend(self.conversation_history)
        messages.append({"role": "user", "content": user_input})
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=150,
                temperature=0.7
            )
            
            assistant_message = response.choices[0].message.content
            
            self.conversation_history.append({"role": "user", "content": user_input})
            self.conversation_history.append({"role": "assistant", "content": assistant_message})
            
            # Keep conversation history to a reasonable length
            if len(self.conversation_history) > 10: # 5 user/assistant pairs
                self.conversation_history = self.conversation_history[-10:]
            
            return assistant_message
        except Exception as e:
            print(f"Error during OpenAI LLM generation: {e}")
            return "I'm sorry, I'm having trouble understanding right now. Please try again later."
