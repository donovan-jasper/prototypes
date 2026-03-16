# AVA (Asterisk Voice Assistant)

## One-line pitch
Self-hosted AI voice agent that adds conversational AI to existing Asterisk phone systems without cloud migration or per-minute fees.

## Overview
AVA is a prototype demonstrating how to integrate modern AI voice capabilities (STT, LLM, TTS) with an Asterisk PBX using the Asterisk REST Interface (ARI). It aims to provide a self-hosted solution for conversational AI on telephony, avoiding external cloud dependencies and per-minute fees for core AI processing.

**Note on Prototype Limitations:**
This is a prototype to demonstrate the architecture and core AI pipeline. The real-time audio streaming between Asterisk and the AVA application for bidirectional conversation is complex. In this prototype, the `ari_handler.py` simulates a single turn of conversation by directly feeding text to the LLM/TTS after an initial greeting, rather than processing live audio chunks from the caller. A full real-time implementation would typically involve Asterisk's `ExternalMedia` connecting to a WebSocket endpoint on the AVA server for raw audio streaming.

## Tech Stack
-   **Backend**: Python 3.11+ with FastAPI (async support for real-time audio)
-   **Telephony**: Asterisk ARI (Asterisk REST Interface) client library (`ari-py`)
-   **Audio Processing**: `pydub`, `audioop` for format conversion
-   **AI Services**:
    -   STT: OpenAI Whisper API (configurable for local Whisper)
    -   LLM: OpenAI GPT-4 API (configurable for local LLaMA)
    -   TTS: OpenAI TTS API (configurable for piper-tts)
-   **Storage**: SQLite for call logs and configuration
-   **Frontend**: Vanilla HTML/CSS/JS for admin dashboard
-   **Deployment**: Docker + Docker Compose

## Core Features
1.  **ARI Call Handler**: Connects to Asterisk ARI, answers incoming calls, and manages call state.
2.  **Real-time Audio Pipeline (Simulated)**: Converts telephony audio (8kHz μ-law) to AI-compatible formats (16kHz/24kHz PCM). Includes basic VAD for turn detection (though real-time audio input is simulated in this prototype).
3.  **AI Conversation Engine**: Orchestrates STT → LLM → TTS pipeline with configurable system prompts and provider selection.
4.  **Admin Dashboard**: Web UI to configure AI system prompts, view recent call logs, and monitor system health.
5.  **Docker Deployment**: Complete containerized setup with Asterisk and AVA for easy deployment.

## File Structure
