from openai import AsyncOpenAI
import io

class OpenAISTT:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("OpenAI API key is required for STT.")
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def transcribe(self, audio_data: bytes) -> str:
        """Transcribe audio using Whisper API"""
        audio_file = io.BytesIO(audio_data)
        audio_file.name = "audio.wav" # OpenAI API requires a filename
        
        try:
            transcript = await self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="en" # Assuming English for now
            )
            return transcript.text
        except Exception as e:
            print(f"Error during OpenAI STT transcription: {e}")
            return ""
