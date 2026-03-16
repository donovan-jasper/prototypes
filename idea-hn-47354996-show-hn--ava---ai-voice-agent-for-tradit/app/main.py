from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import yaml
import asyncio
import logging
import os

from app.database import init_db, get_session
from app.models import CallLog, Configuration
from app.ai_engine import AIEngine
from app.ari_handler import ARIHandler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AVA - Asterisk Voice Assistant")

# Load configuration
config_path = os.getenv("AVA_CONFIG_PATH", "config/ava_config.yaml")
try:
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)
except FileNotFoundError:
    logger.error(f"Configuration file not found at {config_path}. Please ensure it exists.")
    # Exit or provide a default configuration to prevent startup failure
    # For this prototype, we'll assume it exists and raise an error if not.
    raise RuntimeError(f"Configuration file not found at {config_path}")

# Override ARI config from environment variables if present
config['asterisk']['ari_url'] = os.getenv('ASTERISK_ARI_URL', config['asterisk']['ari_url'])
config['asterisk']['ari_user'] = os.getenv('ASTERISK_ARI_USER', config['asterisk']['ari_user'])
config['asterisk']['ari_password'] = os.getenv('ASTERISK_ARI_PASSWORD', config['asterisk']['ari_password'])

# Override AI API keys from environment variables
openai_api_key_env = os.getenv('OPENAI_API_KEY')
if openai_api_key_env:
    config['ai_providers']['stt']['api_key'] = openai_api_key_env
    config['ai_providers']['llm']['api_key'] = openai_api_key_env
    config['ai_providers']['tts']['api_key'] = openai_api_key_env

ai_engine = AIEngine(config)
ari_handler = ARIHandler(config, ai_engine)

@app.on_event("startup")
async def startup():
    await init_db()
    # Run ARI handler in a separate task as client.run() is blocking
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
            "status": call.status,
            "transcript": call.transcript
        }
        for call in calls
    ]

@app.get("/api/config")
async def get_config():
    # Return a copy to prevent direct modification of the live config object
    # and to avoid exposing API keys.
    display_config = {
        "stt_provider": config['ai_providers']['stt']['provider'],
        "llm_provider": config['ai_providers']['llm']['provider'],
        "llm_model": config['ai_providers']['llm']['model'],
        "tts_provider": config['ai_providers']['tts']['provider'],
        "system_prompt": config['ai_providers']['llm']['system_prompt']
    }
    return display_config

@app.post("/api/config")
async def update_config(new_config: dict):
    # Only allow updating specific fields for security and stability
    if 'system_prompt' in new_config:
        config['ai_providers']['llm']['system_prompt'] = new_config['system_prompt']
        ai_engine.llm.system_prompt = new_config['system_prompt'] # Update live engine
    
    # Save updated config back to file
    try:
        with open(config_path, "w") as f:
            yaml.dump(config, f)
        return {"status": "updated", "message": "Configuration saved and applied."}
    except Exception as e:
        logger.error(f"Failed to save configuration: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save configuration: {e}")

@app.get("/api/health")
async def health():
    # Check if ARI handler is connected by checking if session exists
    is_connected = ari_handler.session is not None
    return {
        "status": "healthy",
        "active_calls": len(ari_handler.active_calls),
        "asterisk_connected": is_connected
    }

app.mount("/static", StaticFiles(directory="app/static"), name="static")
