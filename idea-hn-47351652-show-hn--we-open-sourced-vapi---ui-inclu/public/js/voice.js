import { api } from './api.js';

let ws;
let mediaRecorder;
let audioChunks = [];
let audioContext;
let isRecording = false;
let currentWorkflowId = null;
let sessionId = null;

const recordBtn = document.getElementById('record-btn');
const voiceStatus = document.getElementById('voice-status');
const transcriptOutput = document.getElementById('transcript-output');
const llmResponseOutput = document.getElementById('llm-response-output');
const testWorkflowSelect = document.getElementById('test-workflow-select');
const audioWaveform = document.getElementById('audio-waveform');

export function initVoiceTest() {
    recordBtn.addEventListener('click', toggleRecording);
    testWorkflowSelect.addEventListener('change', (e) => {
        currentWorkflowId = e.target.value;
        console.log('Selected workflow for voice test:', currentWorkflowId);
    });

    // Initialize AudioContext for playback
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

export function populateWorkflowSelect(workflows) {
    testWorkflowSelect.innerHTML = '';
    if (workflows.length === 0) {
        testWorkflowSelect.innerHTML = '<option value="">No workflows available</option>';
        testWorkflowSelect.disabled = true;
        recordBtn.disabled = true;
        return;
    }
    testWorkflowSelect.disabled = false;
    recordBtn.disabled = false;

    workflows.forEach(wf => {
        const option = document.createElement('option');
        option.value = wf.id;
        option.textContent = wf.name;
        testWorkflowSelect.appendChild(option);
    });
    currentWorkflowId = testWorkflowSelect.value;
}

async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    if (!currentWorkflowId) {
        alert('Please select a workflow first.');
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // Use webm for broader browser support

        ws = new WebSocket(`ws://${window.location.host}/ws`);

        ws.onopen = () => {
            console.log('WebSocket connected.');
            ws.send(JSON.stringify({ type: 'start_session', workflow_id: currentWorkflowId }));
            voiceStatus.textContent = 'Starting session...';
        };

        ws.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case 'session_started':
                    sessionId = message.sessionId;
                    console.log('Session started:', sessionId);
                    voiceStatus.textContent = 'Recording... Speak now!';
                    recordBtn.classList.add('recording');
                    recordBtn.textContent = 'Stop Recording';
                    isRecording = true;
                    mediaRecorder.start(250); // Send data every 250ms
                    break;
                case 'transcript':
                    transcriptOutput.textContent = message.text;
                    break;
                case 'llm_response':
                    llmResponseOutput.textContent = message.text;
                    break;
                case 'audio_response':
                    const audioData = Uint8Array.from(atob(message.data), c => c.charCodeAt(0)).buffer;
                    await playAudio(audioData);
                    break;
                case 'error':
                    console.error('WebSocket error:', message.message);
                    voiceStatus.textContent = `Error: ${message.message}`;
                    stopRecording();
                    break;
                case 'session_ended':
                    console.log('Session ended.');
                    voiceStatus.textContent = 'Session ended.';
                    stopRecording(false); // Don't send end_session again
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected.');
            stopRecording(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            voiceStatus.textContent = 'WebSocket error. See console.';
            stopRecording();
        };

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && ws && ws.readyState === WebSocket.OPEN) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Audio = reader.result.split(',')[1];
                    ws.send(JSON.stringify({ type: 'audio_chunk', data: base64Audio }));
                    updateWaveform(event.data);
                };
                reader.readAsDataURL(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
            audioChunks = [];
            audioWaveform.style.width = '0%';
        };

    } catch (error) {
        console.error('Error starting recording:', error);
        voiceStatus.textContent = `Error: ${error.message}`;
        alert('Could not access microphone. Please ensure it is enabled and try again.');
    }
}

function stopRecording(sendEndSession = true) {
    if (isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        recordBtn.classList.remove('recording');
        recordBtn.textContent = 'Record';
        voiceStatus.textContent = 'Idle';
    }

    if (ws && ws.readyState === WebSocket.OPEN && sendEndSession) {
        ws.send(JSON.stringify({ type: 'end_session' }));
        ws.close();
    }
    sessionId = null;
}

async function playAudio(audioData) {
    try {
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    } catch (error) {
        console.error('Error playing audio:', error);
    }
}

function updateWaveform(audioBlob) {
    // For a simple visual, we'll just make the bar grow/shrink based on audio presence
    // A more complex visualization would involve analyzing the audio data
    if (audioBlob.size > 0) {
        audioWaveform.style.width = '100%'; // Simulate activity
        setTimeout(() => {
            if (isRecording) { // Only reset if still recording
                audioWaveform.style.width = '0%';
            }
        }, 200); // Reset after a short delay
    }
}
