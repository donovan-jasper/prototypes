import { transcribeAudio } from './stt.js';
import { getLLMCompletion } from './llm.js';
import { generateSpeech } from './tts.js';
import { getProviderConfigByName } from '../db.js';

// Simple unique ID generator for context variables
const generateId = () => Math.random().toString(36).substring(2, 9);

export const executeWorkflow = async (workflowData, audioInputBuffer, providerConfigs) => {
    const { nodes, connections } = workflowData;
    let context = {
        transcript: '',
        llmResponse: '',
        ttsAudio: null,
        history: [], // [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]
        variables: {},
        lastNodeOutput: null,
        currentAudioInput: audioInputBuffer,
    };

    const findNode = (nodeId) => nodes.find(n => n.id === nodeId);
    const findConnectionsFrom = (nodeId) => connections.filter(c => c.from === nodeId);

    let currentNode = nodes.find(n => n.type === 'start');
    if (!currentNode) {
        throw new Error('Workflow must have a Start node.');
    }

    let executionPath = [];
    let maxIterations = 20; // Prevent infinite loops in complex workflows

    while (currentNode && maxIterations > 0) {
        executionPath.push(currentNode.id);
        console.log(`Executing node: ${currentNode.type} (${currentNode.id})`);

        try {
            switch (currentNode.type) {
                case 'start':
                    // Start node just initializes the context or passes through
                    break;

                case 'stt':
                    if (!context.currentAudioInput) {
                        throw new Error('STT node requires audio input.');
                    }
                    const sttProvider = currentNode.config.provider || 'openai-whisper';
                    // In a real app, you'd select provider based on sttProvider
                    context.transcript = await transcribeAudio(context.currentAudioInput);
                    context.history.push({ role: 'user', content: context.transcript });
                    context.lastNodeOutput = context.transcript;
                    console.log('STT Transcript:', context.transcript);
                    break;

                case 'llm':
                    const llmProvider = currentNode.config.provider || 'openai-gpt';
                    const systemPrompt = currentNode.config.systemPrompt || 'You are a helpful AI assistant.';
                    const temperature = currentNode.config.temperature !== undefined ? parseFloat(currentNode.config.temperature) : 0.7;
                    const model = currentNode.config.model;

                    const messages = [
                        { role: 'system', content: systemPrompt },
                        ...context.history
                    ];

                    context.llmResponse = await getLLMCompletion(llmProvider, messages, { temperature, model });
                    context.history.push({ role: 'assistant', content: context.llmResponse });
                    context.lastNodeOutput = context.llmResponse;
                    console.log('LLM Response:', context.llmResponse);
                    break;

                case 'tts':
                    if (!context.llmResponse) {
                        throw new Error('TTS node requires LLM response or text input.');
                    }
                    const ttsProvider = currentNode.config.provider || 'openai-tts';
                    const voice = currentNode.config.voice || 'alloy';
                    // In a real app, you'd select provider based on ttsProvider
                    context.ttsAudio = await generateSpeech(context.llmResponse, voice);
                    context.lastNodeOutput = context.ttsAudio;
                    console.log('TTS Audio generated.');
                    break;

                case 'branch':
                    const condition = currentNode.config.condition; // e.g., "context.llmResponse.includes('yes')"
                    let branchTaken = false;
                    const outgoingConnections = findConnectionsFrom(currentNode.id);

                    for (const conn of outgoingConnections) {
                        if (conn.condition) {
                            // Evaluate the condition. For a prototype, a simple eval is used.
                            // In production, use a safer expression evaluator.
                            const conditionMet = eval(conn.condition); // DANGER: Insecure for untrusted input
                            if (conditionMet) {
                                currentNode = findNode(conn.to);
                                branchTaken = true;
                                break;
                            }
                        }
                    }
                    if (!branchTaken) {
                        // If no conditional branch is taken, look for a default (unconditional) connection
                        const defaultConnection = outgoingConnections.find(conn => !conn.condition);
                        if (defaultConnection) {
                            currentNode = findNode(defaultConnection.to);
                        } else {
                            currentNode = null; // No path forward
                        }
                    }
                    break;

                case 'end':
                    currentNode = null; // End of workflow
                    break;

                default:
                    console.warn(`Unknown node type: ${currentNode.type}`);
                    currentNode = null; // Stop execution
                    break;
            }
        } catch (error) {
            console.error(`Error executing node ${currentNode.id} (${currentNode.type}):`, error);
            context.llmResponse = `An error occurred: ${error.message}`;
            context.ttsAudio = await generateSpeech(context.llmResponse);
            currentNode = null; // Stop execution on error
        }

        if (currentNode && currentNode.type !== 'branch') {
            const nextConnections = findConnectionsFrom(currentNode.id);
            if (nextConnections.length > 0) {
                // For non-branch nodes, just take the first outgoing connection
                currentNode = findNode(nextConnections[0].to);
            } else {
                currentNode = null; // No more connections
            }
        }
        maxIterations--;
    }

    if (maxIterations === 0) {
        console.warn('Workflow execution stopped due to max iterations limit.');
    }

    return {
        transcript: context.transcript,
        llmResponse: context.llmResponse,
        ttsAudio: context.ttsAudio,
        history: context.history,
        variables: context.variables,
    };
};
