from openai import AsyncOpenAI

class OpenAITTS:
    def __init__(self, api_key: str, voice: str = "alloy"):
        if not api_key:
            raise ValueError("OpenAI API key is required for TTS.")
        self.client = AsyncOpenAI(api_key=api_key)
        self.voice = voice
    
    async def synthesize(self, text: str) -> bytes:
        """Synthesize speech using OpenAI TTS"""
        try:
            response = await self.client.audio.speech.create(
                model="tts-1",
                voice=self.voice,
                input=text,
                response_format="pcm" # Returns raw 24kHz 16-bit PCM
            )
            return response.content
        except Exception as e:
            print(f"Error during OpenAI TTS synthesis: {e}")
            return b""
