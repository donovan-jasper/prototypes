import audioop
import io
from pydub import AudioSegment

class AudioProcessor:
    def __init__(self, vad_threshold=0.02):
        self.vad_threshold = vad_threshold
        self.sample_rate_in = 8000  # Asterisk μ-law
        self.sample_rate_out_stt = 16000  # Whisper compatible
        self.sample_rate_out_tts = 24000 # OpenAI TTS output rate
        
    def ulaw_to_linear(self, ulaw_data: bytes) -> bytes:
        """Convert μ-law to linear PCM (16-bit, mono)"""
        return audioop.ulaw2lin(ulaw_data, 2)
    
    def linear_to_ulaw(self, linear_data: bytes) -> bytes:
        """Convert linear PCM (16-bit, mono) to μ-law"""
        return audioop.lin2ulaw(linear_data, 2)
    
    def resample(self, audio_data: bytes, rate_in: int, rate_out: int) -> bytes:
        """Resample audio data (16-bit, mono)"""
        # audioop.ratecv expects 16-bit samples, 1 channel
        if rate_in == rate_out:
            return audio_data
        return audioop.ratecv(audio_data, 2, 1, rate_in, rate_out, None)[0]
    
    def convert_for_stt(self, ulaw_data: bytes) -> bytes:
        """Convert Asterisk audio (8kHz μ-law) to STT-compatible format (16kHz linear PCM)"""
        linear = self.ulaw_to_linear(ulaw_data)
        resampled = self.resample(linear, self.sample_rate_in, self.sample_rate_out_stt)
        return resampled
    
    def convert_for_asterisk(self, audio_data: bytes, source_rate: int) -> bytes:
        """Convert TTS audio (e.g., 24kHz linear PCM) to Asterisk format (8kHz μ-law)"""
        resampled = self.resample(audio_data, source_rate, self.sample_rate_in)
        return self.linear_to_ulaw(resampled)
    
    def detect_speech(self, audio_data: bytes) -> bool:
        """Simple VAD based on RMS energy for 16-bit linear PCM"""
        if not audio_data:
            return False
        rms = audioop.rms(audio_data, 2) # 2 bytes per sample for 16-bit PCM
        # Max RMS for 16-bit PCM is 32767
        normalized_rms = rms / 32768.0
        return normalized_rms > self.vad_threshold
    
    def pcm_to_wav(self, pcm_data: bytes, sample_rate: int) -> bytes:
        """Convert raw 16-bit PCM to WAV format for STT"""
        audio = AudioSegment(
            data=pcm_data,
            sample_width=2, # 16-bit PCM
            frame_rate=sample_rate,
            channels=1
        )
        wav_io = io.BytesIO()
        audio.export(wav_io, format="wav")
        return wav_io.getvalue()
