import asyncio
import logging
from app.ai_engine import AIEngine
from app.database import async_session
from app.models import CallLog
from datetime import datetime
from sqlalchemy import select
import aiohttp
import json

logger = logging.getLogger(__name__)

class ARIHandler:
    def __init__(self, config: dict, ai_engine: AIEngine):
        self.config = config
        self.ai_engine = ai_engine
        self.session = None
        self.ws = None
        self.active_calls = {}
        self.app_name = config['asterisk']['app_name']
        self.ari_url = config['asterisk']['ari_url']
        self.ari_user = config['asterisk']['ari_user']
        self.ari_password = config['asterisk']['ari_password']
        
    async def connect(self):
        """Connect to Asterisk ARI"""
        ari_config = self.config['asterisk']
        auth = aiohttp.BasicAuth(self.ari_user, self.ari_password)
        
        try:
            self.session = aiohttp.ClientSession(auth=auth)
            
            # Subscribe to Stasis application events
            subscribe_url = f"{self.ari_url}/ari/applications/{self.app_name}"
            async with self.session.post(subscribe_url) as resp:
                if resp.status != 200:
                    logger.error(f"Failed to subscribe to application {self.app_name}")
                    return
            
            # Connect to WebSocket for events
            ws_url = f"{self.ari_url.replace('http', 'ws')}/ari/events?app={self.app_name}"
            self.ws = await self.session.ws_connect(ws_url)
            
            logger.info(f"Connected to Asterisk ARI, listening for app: {self.app_name}")
            
            # Start listening for events
            await self.listen_for_events()
            
        except Exception as e:
            logger.error(f"Failed to connect to Asterisk ARI: {e}", exc_info=True)
            if self.session:
                await self.session.close()
    
    async def listen_for_events(self):
        """Listen for WebSocket events from Asterisk"""
        try:
            async for msg in self.ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    event_data = json.loads(msg.data)
                    event_type = event_data.get('type')
                    
                    if event_type == 'StasisStart':
                        await self.on_start(event_data)
                    elif event_type == 'StasisEnd':
                        await self.on_end(event_data)
                elif msg.type == aiohttp.WSMsgType.ERROR:
                    logger.error(f"WebSocket error: {self.ws.exception()}")
                    break
        except Exception as e:
            logger.error(f"Error in WebSocket listener: {e}", exc_info=True)
        finally:
            if self.session:
                await self.session.close()
    
    async def on_start(self, event_data):
        """Handle new call"""
        channel_id = event_data['channel']['id']
        caller_number = event_data['channel'].get('caller', {}).get('number', 'Unknown')
        
        logger.info(f"New call: {channel_id} from {caller_number}")
        
        # Spawn a task to handle the call asynchronously
        asyncio.create_task(self.handle_call(channel_id, caller_number))
    
    async def on_end(self, event_data):
        """Handle call end"""
        channel_id = event_data['channel']['id']
        logger.info(f"Call ended: {channel_id}")
        
        if channel_id in self.active_calls:
            self.active_calls[channel_id]['active'] = False
    
    async def handle_call(self, channel_id: str, caller_number: str):
        """Main call handling logic"""
        start_time = datetime.utcnow()
        call_log_id = None
        
        async with async_session() as session:
            call_log = CallLog(
                call_id=channel_id,
                caller_number=caller_number,
                start_time=start_time,
                status="active"
            )
            session.add(call_log)
            await session.commit()
            await session.refresh(call_log) # Get the ID
            call_log_id = call_log.id
        
        self.active_calls[channel_id] = {'active': True, 'transcript': [], 'call_log_id': call_log_id}
        self.ai_engine.reset()
        
        try:
            # Answer the channel
            answer_url = f"{self.ari_url}/ari/channels/{channel_id}/answer"
            async with self.session.post(answer_url) as resp:
                if resp.status != 204:
                    logger.error(f"Failed to answer channel {channel_id}")
                    return
            
            logger.info(f"Channel {channel_id} answered.")
            
            greeting_text = "Hello! I'm AVA, your AI assistant. How can I help you today?"
            greeting_audio_pcm = await self.ai_engine.tts.synthesize(greeting_text)
            
            # Play the greeting
            await self.play_audio_to_channel(channel_id, greeting_audio_pcm)
            self.active_calls[channel_id]['transcript'].append(f"AVA: {greeting_text}")
            
            logger.info(f"Starting simulated audio processing for {channel_id}")
            
            # --- PROTOTYPE SIMULATION OF CONVERSATION TURN ---
            # In a full implementation, `ulaw_chunk` would come from a WebSocket
            # connected via ExternalMedia, and `ai_engine.process_audio_chunk`
            # would be called repeatedly.
            
            # Simulate user speaking after greeting
            await asyncio.sleep(2) # User thinking/speaking
            simulated_user_transcript = "I'd like to know about your services."
            logger.info(f"Simulated user input: {simulated_user_transcript}")
            self.active_calls[channel_id]['transcript'].append(f"User: {simulated_user_transcript}")
            
            response_audio_pcm = await self.ai_engine.process_utterance_from_text(simulated_user_transcript)
            
            if response_audio_pcm:
                # Get the last AI response text from the LLM's conversation history
                response_text = self.ai_engine.llm.conversation_history[-1]['content'] if self.ai_engine.llm.conversation_history else "No response."
                logger.info(f"Playing AI response to {channel_id}: '{response_text}'")
                await self.play_audio_to_channel(channel_id, response_audio_pcm)
                self.active_calls[channel_id]['transcript'].append(f"AVA: {response_text}")
            
            await asyncio.sleep(1) # Give time for response to "play"
            
            # End the call after one simulated turn for the prototype
            hangup_url = f"{self.ari_url}/ari/channels/{channel_id}"
            async with self.session.delete(hangup_url) as resp:
                if resp.status != 204:
                    logger.warning(f"Failed to hangup channel {channel_id}, status: {resp.status}")
            logger.info(f"Channel {channel_id} hung up after simulated conversation.")

        except Exception as e:
            logger.error(f"Error handling call {channel_id}: {e}", exc_info=True)
            try:
                hangup_url = f"{self.ari_url}/ari/channels/{channel_id}"
                async with self.session.delete(hangup_url) as resp:
                    if resp.status != 204:
                        logger.error(f"Failed to hangup channel {channel_id} after error: {resp.status}")
            except Exception as h_e:
                logger.error(f"Failed to hangup channel {channel_id} after general error: {h_e}")
        finally:
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            async with async_session() as session:
                if call_log_id:
                    result = await session.execute(
                        select(CallLog).where(CallLog.id == call_log_id)
                    )
                    call_log = result.scalar_one_or_none()
                    if call_log:
                        call_log.end_time = end_time
                        call_log.duration = duration
                        call_log.status = "completed"
                        call_log.transcript = "\n".join(self.active_calls[channel_id]['transcript'])
                        await session.commit()
                        logger.info(f"Call log updated for {channel_id}")
                else:
                    logger.warning(f"Call log ID not found for {channel_id} during cleanup.")
            
            if channel_id in self.active_calls:
                del self.active_calls[channel_id]
            logger.info(f"Call {channel_id} handling finished.")
    
    async def play_audio_to_channel(self, channel_id: str, audio_data: bytes):
        """
        Play audio to a specific channel.
        This is a simplified approach - in practice, you'd save the audio to a file
        accessible by Asterisk and play it using the sound URI.
        """
        # For this prototype, we'll simulate by saving to a temporary file
        # and using Asterisk's playback mechanism
        import tempfile
        import os
        
        # Create a temporary file for the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.raw', dir='/tmp') as temp_file:
            temp_file.write(audio_data)
            temp_filename = temp_file.name
        
        try:
            # Tell Asterisk to play the file
            # Note: This assumes Asterisk can access /tmp/ files
            # In a real deployment, you'd want to place files in Asterisk's sounds directory
            playback_uri = f"file://{temp_filename}"
            playback_url = f"{self.ari_url}/ari/channels/{channel_id}/play"
            
            async with self.session.post(playback_url, params={'media': playback_uri}) as resp:
                if resp.status != 200:
                    logger.error(f"Failed to play audio to channel {channel_id}, status: {resp.status}")
                else:
                    logger.debug(f"Played audio to channel {channel_id}")
        finally:
            # Clean up the temporary file
            try:
                os.unlink(temp_filename)
            except OSError:
                pass  # File might have been deleted by Asterisk
