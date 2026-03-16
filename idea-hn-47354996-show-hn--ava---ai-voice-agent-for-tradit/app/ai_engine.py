import asyncio
from app.providers.stt_openai import OpenAISTT
from app.providers.llm_openai import OpenAILLM
from app.providers.tts_openai import OpenAITTS
from app.audio_processor import AudioProcessor

class AIEngine:
    def __init__(self, config: dict):
        self.config = config
        self.audio_processor = AudioProcessor(
            vad_threshold=config['audio']['vad_threshold']
        )
        
        stt_config = config['ai_providers']['stt']
        llm_config = config['ai_providers']['llm']
        tts_config = config['ai_providers']['tts']
        
        self.stt = OpenAISTT(stt_config['api_key'])
        self.llm = OpenAILLM(
            llm_config['api_key'],
            llm_config['model'],
            llm_config['system_prompt']
        )
        self.tts = OpenAITTS(tts_config['api_key'], tts_config['voice'])
        
        self.audio_buffer = bytearray()
        self.silence_duration = config['audio']['silence_duration']
        self.last_speech_time = None
    
    def reset(self):
        self.llm.reset_conversation()
        self.audio_buffer.clear()
        self.last_speech_time = None
    
    async def process_audio_chunk(self, ulaw_chunk: bytes) -> tuple[bool, bytes]:
        """
        Process incoming audio chunk
        Returns: (should_process, audio_data_if_ready)
        """
        linear_chunk = self.audio_processor.ulaw_to_linear(ulaw_chunk)
        
        if self.audio_processor.detect_speech(linear_chunk):
            self.audio_buffer.extend(linear_chunk)
            self.last_speech_time = asyncio.get_event_loop().time()
            return False, b""
        
        if self.last_speech_time and len(self.audio_buffer) > 0:
            silence_time = asyncio.get_event_loop().time() - self.last_speech_time
            if silence_time >= self.silence_duration:
                audio_data = bytes(self.audio_buffer)
                self.audio_buffer.clear()
                self.last_speech_time = None
                return True, audio_data
        
        return False, b""
    
    async def process_utterance(self, audio_data: bytes) -> bytes:
        """Process complete utterance through STT -> LLM -> TTS pipeline"""
        resampled = self.audio_processor.resample(audio_data, 8000, 16000)
        wav_data = self.audio_processor.pcm_to_wav(resampled, 16000)
        
        transcript = await self.stt.transcribe(wav_data)
        
        if not transcript.strip():
            return b""
        
        response_text = await self.llm.generate_response(transcript)
        
        tts_audio = await self.tts.synthesize(response_text)
        
        asterisk_audio = self.audio_processor.convert_for_asterisk(tts_audio, 24000)
        
        return asterisk_audio
    
    async def process_utterance_from_text(self, text: str) -> bytes:
        """Process text directly through LLM -> TTS pipeline (for simulation)"""
        response_text = await self.llm.generate_response(text)
        
        tts_audio = await self.tts.synthesize(response_text)
        
        asterisk_audio = self.audio_processor.convert_for_asterisk(tts_audio, 24000)
        
        return asterisk_audio
