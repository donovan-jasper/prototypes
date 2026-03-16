# AVA (Asterisk Voice Assistant)

## One-line pitch
Self-hosted AI voice agent that adds conversational AI to existing Asterisk phone systems without cloud migration or per-minute fees.

## Tech stack
- **Backend**: Python 3.11+ with FastAPI (async support for real-time audio)
- **Telephony**: Asterisk ARI (Asterisk REST Interface) client library
- **Audio Processing**: pydub, audioop for format conversion
- **AI Services**: 
  - STT: OpenAI Whisper API (with fallback to local Whisper)
  - LLM: OpenAI GPT-4 API (configurable for local LLaMA)
  - TTS: OpenAI TTS API (with fallback to piper-tts)
- **Storage**: SQLite for call logs and configuration
- **Frontend**: Vanilla HTML/CSS/JS for admin dashboard
- **Deployment**: Docker + Docker Compose

## Core features

1. **ARI Call Handler**: Answers incoming calls via Asterisk ARI, manages call state, and handles audio streaming
2. **Real-time Audio Pipeline**: Converts telephony audio (8kHz μ-law) to AI-compatible formats, implements basic VAD for turn detection
3. **AI Conversation Engine**: Orchestrates STT → LLM → TTS pipeline with configurable system prompts and provider selection
4. **Admin Dashboard**: Web UI to configure AI providers, view call logs, and test the system
5. **Docker Deployment**: Complete containerized setup with Asterisk + AVA that works out-of-the-box

## File structure

```
ava/
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── README.md
├── config/
│   ├── asterisk/
│   │   ├── extensions.conf
│   │   ├── ari.conf
│   │   └── pjsip.conf
│   └── ava_config.yaml
├── app/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── ari_handler.py
│   ├── audio_processor.py
│   ├── ai_engine.py
│   ├── providers/
│   │   ├── __init__.py
│   │   ├── stt_openai.py
│   │   ├── llm_openai.py
│   │   └── tts_openai.py
│   └── static/
│       ├── index.html
│       ├── style.css
│       └── app.js
└── tests/
    └── test_call.py
```

## Implementation steps

### Step 1: Project setup and dependencies

Create `requirements.txt`:
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
ari-py==0.1.3
pydub==0.25.1
openai==1.12.0
pyyaml==6.0.1
sqlalchemy==2.0.25
aiosqlite==0.19.0
websockets==12.0
httpx==0.26.0
```

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  asterisk:
    image: andrius/asterisk:18
    ports:
      - "5060:5060/udp"
      - "8088:8088"
    volumes:
      - ./config/asterisk:/etc/asterisk
    networks:
      - ava-network
  
  ava:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ASTERISK_ARI_URL=http://asterisk:8088
      - ASTERISK_ARI_USER=ava
      - ASTERISK_ARI_PASSWORD=ava_secret
    volumes:
      - ./config/ava_config.yaml:/app/config/ava_config.yaml
      - ./data:/app/data
    depends_on:
      - asterisk
    networks:
      - ava-network

networks:
  ava-network:
    driver: bridge
```

### Step 2: Asterisk configuration

Create `config/asterisk/ari.conf`:
```ini
[general]
enabled = yes
pretty = yes

[ava]
type = user
read_only = no
password = ava_secret
```

Create `config/asterisk/extensions.conf`:
```ini
[default]
exten => 100,1,NoOp(AVA AI Agent)
 same => n,Stasis(ava-app)
 same => n,Hangup()
```

Create `config/asterisk/pjsip.conf`:
```ini
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0

[6001]
type=endpoint
context=default
disallow=all
allow=ulaw
auth=6001
aors=6001

[6001]
type=auth
auth_type=userpass
password=test123
username=6001

[6001]
type=aor
max_contacts=1
```

### Step 3: Configuration and database models

Create `config/ava_config.yaml`:
```yaml
asterisk:
  ari_url: "http://asterisk:8088"
  ari_user: "ava"
  ari_password: "ava_secret"
  app_name: "ava-app"

ai_providers:
  stt:
    provider: "openai"
    api_key: ""
  llm:
    provider: "openai"
    api_key: ""
    model: "gpt-4"
    system_prompt: "You are a helpful phone assistant. Keep responses brief and conversational."
  tts:
    provider: "openai"
    api_key: ""
    voice: "alloy"

audio:
  vad_threshold: 0.02
  silence_duration: 1.5
```

Create `app/models.py`:
```python
from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class CallLog(Base):
    __tablename__ = "call_logs"
    
    id = Column(Integer, primary_key=True)
    call_id = Column(String(100), unique=True)
    caller_number = Column(String(50))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Float, nullable=True)
    transcript = Column(Text, nullable=True)
    status = Column(String(20))

class Configuration(Base):
    __tablename__ = "configuration"
    
    id = Column(Integer, primary_key=True)
    key = Column(String(100), unique=True)
    value = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

Create `app/database.py`:
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models import Base

DATABASE_URL = "sqlite+aiosqlite:///./data/ava.db"

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_session():
    async with async_session() as session:
        yield session
```

### Step 4: Audio processing module

Create `app/audio_processor.py`:
```python
import audioop
import io
from pydub import AudioSegment

class AudioProcessor:
    def __init__(self, vad_threshold=0.02):
        self.vad_threshold = vad_threshold
        self.sample_rate_in = 8000  # Asterisk μ-law
        self.sample_rate_out = 16000  # Whisper compatible
        
    def ulaw_to_linear(self, ulaw_data: bytes) -> bytes:
        """Convert μ-law to linear PCM"""
        return audioop.ulaw2lin(ulaw_data, 2)
    
    def linear_to_ulaw(self, linear_data: bytes) -> bytes:
        """Convert linear PCM to μ-law"""
        return audioop.lin2ulaw(linear_data, 2)
    
    def resample(self, audio_data: bytes, rate_in: int, rate_out: int) -> bytes:
        """Resample audio data"""
        return audioop.ratecv(audio_data, 2, 1, rate_in, rate_out, None)[0]
    
    def convert_for_stt(self, ulaw_data: bytes) -> bytes:
        """Convert Asterisk audio to STT-compatible format"""
        linear = self.ulaw_to_linear(ulaw_data)
        resampled = self.resample(linear, self.sample_rate_in, self.sample_rate_out)
        return resampled
    
    def convert_for_asterisk(self, audio_data: bytes, source_rate: int = 24000) -> bytes:
        """Convert TTS audio to Asterisk format"""
        resampled = self.resample(audio_data, source_rate, self.sample_rate_in)
        return self.linear_to_ulaw(resampled)
    
    def detect_speech(self, audio_data: bytes) -> bool:
        """Simple VAD based on RMS energy"""
        rms = audioop.rms(audio_data, 2)
        normalized_rms = rms / 32768.0
        return normalized_rms > self.vad_threshold
    
    def pcm_to_wav(self, pcm_data: bytes, sample_rate: int = 16000) -> bytes:
        """Convert raw PCM to WAV format for STT"""
        audio = AudioSegment(
            data=pcm_data,
            sample_width=2,
            frame_rate=sample_rate,
            channels=1
        )
        wav_io = io.BytesIO()
        audio.export(wav_io, format="wav")
        return wav_io.getvalue()
```

### Step 5: AI provider implementations

Create `app/providers/stt_openai.py`:
```python
from openai import AsyncOpenAI
import io

class OpenAISTT:
    def __init__(self, api_key: str):
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def transcribe(self, audio_data: bytes) -> str:
        """Transcribe audio using Whisper API"""
        audio_file = io.BytesIO(audio_data)
        audio_file.name = "audio.wav"
        
        transcript = await self.client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="en"
        )
        return transcript.text
```

Create `app/providers/llm_openai.py`:
```python
from openai import AsyncOpenAI

class OpenAILLM:
    def __init__(self, api_key: str, model: str = "gpt-4", system_prompt: str = ""):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
        self.system_prompt = system_prompt
        self.conversation_history = []
    
    def reset_conversation(self):
        self.conversation_history = []
    
    async def generate_response(self, user_input: str) -> str:
        """Generate response using GPT"""
        messages = [{"role": "system", "content": self.system_prompt}]
        messages.extend(self.conversation_history)
        messages.append({"role": "user", "content": user_input})
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=150,
            temperature=0.7
        )
        
        assistant_message = response.choices[0].message.content
        
        self.conversation_history.append({"role": "user", "content": user_input})
        self.conversation_history.append({"role": "assistant", "content": assistant_message})
        
        if len(self.conversation_history) > 10:
            self.conversation_history = self.conversation_history[-10:]
        
        return assistant_message
```

Create `app/providers/tts_openai.py`:
```python
from openai import AsyncOpenAI

class OpenAITTS:
    def __init__(self, api_key: str, voice: str = "alloy"):
        self.client = AsyncOpenAI(api_key=api_key)
        self.voice = voice
    
    async def synthesize(self, text: str) -> bytes:
        """Synthesize speech using OpenAI TTS"""
        response = await self.client.audio.speech.create(
            model="tts-1",
            voice=self.voice,
            input=text,
            response_format="pcm"
        )
        return response.content
```

### Step 6: AI engine orchestration

Create `app/ai_engine.py`:
```python
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
```

### Step 7: ARI call handler

Create `app/ari_handler.py`:
```python
import ari
import asyncio
import logging
from app.ai_engine import AIEngine
from app.database import async_session
from app.models import CallLog
from datetime import datetime

logger = logging.getLogger(__name__)

class ARIHandler:
    def __init__(self, config: dict, ai_engine: AIEngine):
        self.config = config
        self.ai_engine = ai_engine
        self.client = None
        self.active_calls = {}
        
    async def connect(self):
        """Connect to Asterisk ARI"""
        ari_config = self.config['asterisk']
        self.client = ari.connect(
            ari_config['ari_url'],
            ari_config['ari_user'],
            ari_config['ari_password']
        )
        self.client.on_channel_event('StasisStart', self.on_start)
        self.client.on_channel_event('StasisEnd', self.on_end)
        
        logger.info(f"Connected to Asterisk ARI, starting app: {ari_config['app_name']}")
        self.client.run(apps=ari_config['app_name'])
    
    def on_start(self, channel_obj, event):
        """Handle new call"""
        channel = channel_obj.get('channel')
        call_id = channel.id
        caller_number = channel.json.get('caller', {}).get('number', 'Unknown')
        
        logger.info(f"New call: {call_id} from {caller_number}")
        
        asyncio.create_task(self.handle_call(channel, call_id, caller_number))
    
    def on_end(self, channel, event):
        """Handle call end"""
        call_id = channel.id
        logger.info(f"Call ended: {call_id}")
        
        if call_id in self.active_calls:
            self.active_calls[call_id]['active'] = False
    
    async def handle_call(self, channel, call_id: str, caller_number: str):
        """Main call handling logic"""
        async with async_session() as session:
            call_log = CallLog(
                call_id=call_id,
                caller_number=caller_number,
                status="active"
            )
            session.add(call_log)
            await session.commit()
        
        self.active_calls[call_id] = {'active': True, 'transcript': []}
        self.ai_engine.reset()
        
        try:
            channel.answer()
            
            greeting = await self.ai_engine.tts.synthesize(
                "Hello! I'm AVA, your AI assistant. How can I help you today?"
            )
            greeting_ulaw = self.ai_engine.audio_processor.convert_for_asterisk(greeting, 24000)
            
            await self.play_audio(channel, greeting_ulaw)
            
            snoop = channel.snoop(spy='in', app=self.config['asterisk']['app_name'])
            snoop.on_channel_event('ChannelDtmfReceived', lambda c, e: None)
            
            audio_buffer = bytearray()
            
            while self.active_calls.get(call_id, {}).get('active', False):
                await asyncio.sleep(0.1)
                
                # Simulated audio chunk processing
                # In production, use ExternalMedia or snoop channel
                
        except Exception as e:
            logger.error(f"Error handling call {call_id}: {e}")
        finally:
            async with async_session() as session:
                result = await session.execute(
                    f"SELECT * FROM call_logs WHERE call_id = '{call_id}'"
                )
                call_log = result.scalar_one_or_none()
                if call_log:
                    call_log.end_time = datetime.utcnow()
                    call_log.status = "completed"
                    await session.commit()
            
            if call_id in self.active_calls:
                del self.active_calls[call_id]
    
    async def play_audio(self, channel, audio_data: bytes):
        """Play audio to channel"""
        # Simplified - in production, write to media file or use ExternalMedia
        pass
```

### Step 8: FastAPI main application

Create `app/main.py`:
```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import yaml
import asyncio
import logging

from app.database import init_db, get_session
from app.models import CallLog, Configuration
from app.ai_engine import AIEngine
from app.ari_handler import ARIHandler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AVA - Asterisk Voice Assistant")

with open("config/ava_config.yaml", "r") as f:
    config = yaml.safe_load(f)

ai_engine = AIEngine(config)
ari_handler = ARIHandler(config, ai_engine)

@app.on_event("startup")
async def startup():
    await init_db()
    asyncio.create_task(ari_handler.connect())
    logger.info("AVA started successfully")

@app.get("/", response_class=HTMLResponse)
async def root():
    with open("app/static/index.html", "r") as f:
        return f.read()

@app.get("/api/calls")
async def get_calls(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(CallLog).order_by(CallLog.start_time.desc()).limit(50))
    calls = result.scalars().all()
    return [
        {
            "id": call.id,
            "call_id": call.call_id,
            "caller_number": call.caller_number,
            "start_time": call.start_time.isoformat() if call.start_time else None,
            "end_time": call.end_time.isoformat() if call.end_time else None,
            "duration": call.duration,
            "status": call.status
        }
        for call in calls
    ]

@app.get("/api/config")
async def get_config():
    return {
        "stt_provider": config['ai_providers']['stt']['provider'],
        "llm_provider": config['ai_providers']['llm']['provider'],
        "llm_model": config['ai_providers']['llm']['model'],
        "tts_provider": config['ai_providers']['tts']['provider'],
        "system_prompt": config['ai_providers']['llm']['system_prompt']
    }

@app.post("/api/config")
async def update_config(new_config: dict):
    config['ai_providers']['llm']['system_prompt'] = new_config.get('system_prompt', config['ai_providers']['llm']['system_prompt'])
    
    with open("config/ava_config.yaml", "w") as f:
        yaml.dump(config, f)
    
    return {"status": "updated"}

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "active_calls": len(ari_handler.active_calls),
        "asterisk_connected": ari_handler.client is not None
    }

app.mount("/static", StaticFiles(directory="app/static"), name="static")
```

### Step 9: Admin dashboard frontend

Create `app/static/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AVA - Admin Dashboard</title>
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🎙️ AVA Dashboard</h1>
            <div id="status" class="status"></div>
        </header>

        <section class="config-section">
            <h2>Configuration</h2>
            <div class="config-form">
                <label>System Prompt:</label>
                <textarea id="systemPrompt" rows="4"></textarea>
                <button onclick="saveConfig()">Save Configuration</button>
            </div>
            <div class="config-info">
                <p><strong>STT:</strong> <span id="sttProvider"></span></p>
                <p><strong>LLM:</strong> <span id="llmProvider"></span> (<span id="llmModel"></span>)</p>
                <p><strong>TTS:</strong> <span id="ttsProvider"></span></p>
            </div>
        </section>

        <section class="calls-section">
            <h2>Recent Calls</h2>
            <table id="callsTable">
                <thead>
                    <tr>
                        <th>Call ID</th>
                        <th>Caller</th>
                        <th>Start Time</th>
                        <th>Duration</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </section>
    </div>
    <script src="/static/app.js"></script>
</body>
</html>
```

Create `app/static/style.css`:
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    overflow: hidden;
}

header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

h1 {
    font-size: 2em;
}

h2 {
    margin-bottom: 20px;
    color: #333;
}

.status {
    padding: 8px 16px;
    border-radius: 20px;
    background: rgba(255,255,255,0.2);
    font-size: 0.9em;
}

.status.healthy {
    background: #10b981;
}

.status.error {
    background: #ef4444;
}

section {
    padding: 30px;
    border-bottom: 1px solid #e5e7eb;
}

section:last-child {
    border-bottom: none;
}

.config-form {
    margin-bottom: 20px;
}

.config-form label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #374151;
}

.config-form textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
}

.config-form button {
    margin-top: 12px;
    padding: 12px 24px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.config-form button:hover {
    background: #5568d3;
}

.config-info {
    background: #f9fafb;
    padding: 16px;
    border-radius: 8px;
}

.config-info p {
    margin: 8px 0;
    color: #6b7280;
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background: #f9fafb;
}

th {
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
}

td {
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
    color: #6b7280;
}

tbody tr:hover {
    background: #f9fafb;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.85em;
    font-weight: 600;
}

.status-badge.active {
    background: #dbeafe;
    color: #1e40af;
}

.status-badge.completed {
    background: #d1fae5;
    color: #065f46;
}
```

Create `app/static/app.js`:
```javascript
async function fetchHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        const statusEl = document.getElementById('status');
        statusEl.textContent = `${data.status.toUpperCase()} | Active Calls: ${data.active_calls}`;
        statusEl.className = `status ${data.asterisk_connected ? 'healthy' : 'error'}`;
    } catch (error) {
        console.error('Health check failed:', error);
    }
}

async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        document.getElementById('systemPrompt').value = config.system_prompt;
        document.getElementById('sttProvider').textContent = config.stt_provider;
        document.getElementById('llmProvider').textContent = config.llm_provider;
        document.getElementById('llmModel').textContent = config.llm_model;
        document.getElementById('ttsProvider').textContent = config.tts_provider;
    } catch (error) {
        console.error('Failed to load config:', error);
    }
}

async function saveConfig() {
    const systemPrompt = document.getElementById('systemPrompt').value;
    try {
        await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ system_prompt: systemPrompt })
        });
        alert('Configuration saved successfully!');
    } catch (error) {
        console.error('Failed to save config:', error);
        alert('Failed to save configuration');
    