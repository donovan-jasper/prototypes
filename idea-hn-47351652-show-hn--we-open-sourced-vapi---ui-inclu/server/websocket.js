import { WebSocketServer } from 'ws';
import { executeWorkflow } from './services/executor.js';
import { getWorkflowById, createSession, updateSessionStatus } from './db.js';
import { generateSpeech } from './services/tts.js';
import { v4 as uuidv4 } from 'uuid';

const SESSIONS = new Map();

const SILENCE_THRESHOLD_MS = 1000;
const MAX_AUDIO_BUFFER_MS = 10000;

export const setupWebSocket = (server) => {
    const wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', (ws) => {
        const sessionId = uuidv4();
        console.log(`WebSocket client connected. Session ID: ${sessionId}`);

        SESSIONS.set(sessionId, {
            ws,
            workflowId: null,
            audioBuffer: [],
            lastAudioTimestamp: 0,
            timeoutId: null,
            context: {},
            isProcessing: false,
        });

        ws.on('message', async (message) => {
            const session = SESSIONS.get(sessionId);
            if (!session) return;

            try {
                const parsedMessage = JSON.parse(message.toString());

                switch (parsedMessage.type) {
                    case 'start_session':
                        session.workflowId = parsedMessage.workflow_id;
                        await createSession(sessionId, session.workflowId, 'active');
                        ws.send(JSON.stringify({ type: 'session_started', sessionId: sessionId }));
                        console.log(`Session ${sessionId} started for workflow ${session.workflowId}`);
                        break;

                    case 'audio_chunk':
                        if (!session.workflowId) {
                            ws.send(JSON.stringify({ type: 'error', message: 'Session not started. Send start_session first.' }));
                            return;
                        }

                        const audioData = Buffer.from(parsedMessage.data, 'base64');
                        session.audioBuffer.push(audioData);
                        session.lastAudioTimestamp = Date.now();

                        if (session.timeoutId) {
                            clearTimeout(session.timeoutId);
                        }

                        session.timeoutId = setTimeout(() => processAudio(sessionId), SILENCE_THRESHOLD_MS);

                        const currentBufferLength = session.audioBuffer.reduce((acc, chunk) => acc + chunk.length, 0);
                        if (currentBufferLength > MAX_AUDIO_BUFFER_MS * 16) {
                            console.log(`Session ${sessionId}: Max buffer reached, processing audio.`);
                            if (session.timeoutId) {
                                clearTimeout(session.timeoutId);
                            }
                            processAudio(sessionId);
                        }
                        break;

                    case 'end_session':
                        if (session.timeoutId) {
                            clearTimeout(session.timeoutId);
                        }
                        await updateSessionStatus(sessionId, 'ended', { finalTranscript: session.context.transcript });
                        ws.send(JSON.stringify({ type: 'session_ended' }));
                        console.log(`Session ${sessionId} ended.`);
                        SESSIONS.delete(sessionId);
                        break;

                    default:
                        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
                        break;
                }
            } catch (error) {
                console.error(`WebSocket message error for session ${sessionId}:`, error);
                ws.send(JSON.stringify({ type: 'error', message: error.message }));
            }
        });

        ws.on('close', async () => {
            const session = SESSIONS.get(sessionId);
            if (session) {
                if (session.timeoutId) {
                    clearTimeout(session.timeoutId);
                }
                if (session.workflowId) {
                    await updateSessionStatus(sessionId, 'disconnected', { finalTranscript: session.context.transcript });
                }
                console.log(`WebSocket client disconnected. Session ID: ${sessionId}`);
                SESSIONS.delete(sessionId);
            }
        });

        ws.on('error', (error) => {
            console.error(`WebSocket error for session ${sessionId}:`, error);
        });
    });
};

const processAudio = async (sessionId) => {
    const session = SESSIONS.get(sessionId);
    if (!session || session.isProcessing || session.audioBuffer.length === 0) {
        return;
    }

    session.isProcessing = true;
    const ws = session.ws;
    const workflowId = session.workflowId;
    const audioToProcess = Buffer.concat(session.audioBuffer);
    session.audioBuffer = [];

    try {
        const workflow = await getWorkflowById(workflowId);
        if (!workflow) {
            throw new Error(`Workflow with ID ${workflowId} not found.`);
        }

        const workflowData = JSON.parse(workflow.data);
        const result = await executeWorkflow(workflowData, audioToProcess);

        if (result.transcript) {
            ws.send(JSON.stringify({ type: 'transcript', text: result.transcript }));
            session.context.transcript = result.transcript;
        }
        if (result.llmResponse) {
            ws.send(JSON.stringify({ type: 'llm_response', text: result.llmResponse }));
            session.context.llmResponse = result.llmResponse;
        }
        if (result.ttsAudio) {
            ws.send(JSON.stringify({ type: 'audio_response', data: result.ttsAudio.toString('base64') }));
        }

    } catch (error) {
        console.error(`Error processing audio for session ${sessionId}:`, error);
        ws.send(JSON.stringify({ type: 'error', message: `Workflow execution failed: ${error.message}` }));
        try {
            const errorAudio = await generateSpeech(`I apologize, but an error occurred: ${error.message}`);
            ws.send(JSON.stringify({ type: 'audio_response', data: errorAudio.toString('base64') }));
        } catch (ttsError) {
            console.error('Failed to generate error speech:', ttsError);
        }
    } finally {
        session.isProcessing = false;
    }
};
