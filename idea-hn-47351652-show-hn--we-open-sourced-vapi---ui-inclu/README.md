# VoiceForge

## One-line pitch
Open-source visual platform for building real-time voice AI agents with drag-and-drop workflow design, multi-provider integration, and zero per-minute fees.

## Core Features

1.  **Visual Workflow Builder**: Drag-and-drop canvas to design voice agent flows with nodes for STT, LLM, TTS, logic branches, and actions.
2.  **Multi-Provider Integration**: Configure and switch between OpenAI Whisper/GPT/TTS and Anthropic Claude with API key management.
3.  **Real-time Voice Testing**: Browser-based voice chat interface to test agents in real-time using WebRTC and Web Audio API.
4.  **Workflow Persistence**: Save, load, and deploy workflows with SQLite storage.
5.  **Simple Telephony Bridge**: Webhook endpoint for Twilio integration to connect workflows to phone calls.

## Tech Stack

*   **Backend**: Node.js + Express
*   **Database**: SQLite (with `better-sqlite3`)
*   **Frontend**: Vanilla HTML/CSS/JS with Canvas API for visual editor
*   **Real-time**: WebSocket (`ws` library)
*   **Voice**: Web Audio API, WebRTC
*   **AI Providers**: OpenAI (Whisper, TTS, GPT), Anthropic Claude (via API)
*   **Telephony**: Twilio (optional integration)

## Prerequisites

*   Node.js (v18 or higher recommended)
*   An OpenAI API Key
*   An Anthropic API Key (optional, but recommended for full functionality)
*   A Twilio Account SID and Auth Token (optional, for telephony integration)

## Installation

1.  **Clone the repository**:
    
