export const nodeTypes = {
    start: {
        label: 'Start',
        color: '#8BC34A', // Light Green
        inputs: 0,
        outputs: 1,
        config: {},
        form: []
    },
    stt: {
        label: 'STT',
        color: '#2196F3', // Blue
        inputs: 1,
        outputs: 1,
        config: {
            provider: 'openai-whisper', // Default
            language: 'en-US'
        },
        form: [
            { id: 'provider', label: 'Provider', type: 'select', options: ['openai-whisper'] },
            { id: 'language', label: 'Language', type: 'text', placeholder: 'en-US' }
        ]
    },
    llm: {
        label: 'LLM',
        color: '#4CAF50', // Green
        inputs: 1,
        outputs: 1,
        config: {
            provider: 'openai-gpt', // Default
            model: 'gpt-3.5-turbo',
            systemPrompt: 'You are a helpful AI assistant.',
            temperature: 0.7
        },
        form: [
            { id: 'provider', label: 'Provider', type: 'select', options: ['openai-gpt', 'anthropic-claude'] },
            { id: 'model', label: 'Model', type: 'text', placeholder: 'gpt-3.5-turbo' },
            { id: 'systemPrompt', label: 'System Prompt', type: 'textarea', placeholder: 'You are a helpful AI assistant.' },
            { id: 'temperature', label: 'Temperature', type: 'number', min: 0, max: 1, step: 0.1 }
        ]
    },
    tts: {
        label: 'TTS',
        color: '#9C27B0', // Purple
        inputs: 1,
        outputs: 1,
        config: {
            provider: 'openai-tts', // Default
            voice: 'alloy', // Default OpenAI voice
            format: 'opus'
        },
        form: [
            { id: 'provider', label: 'Provider', type: 'select', options: ['openai-tts'] },
            { id: 'voice', label: 'Voice', type: 'select', options: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] },
            { id: 'format', label: 'Format', type: 'select', options: ['opus', 'mp3', 'pcm'] }
        ]
    },
    branch: {
        label: 'Branch',
        color: '#FF9800', // Orange
        inputs: 1,
        outputs: 2, // Can have multiple conditional outputs
        config: {
            condition: 'context.llmResponse.includes("yes")'
        },
        form: [
            { id: 'condition', label: 'Condition (JS)', type: 'textarea', placeholder: 'context.llmResponse.includes("yes")' }
        ]
    },
    end: {
        label: 'End',
        color: '#F44336', // Red
        inputs: 1,
        outputs: 0,
        config: {},
        form: []
    }
};

export function createNode(type, x, y) {
    const nodeDef = nodeTypes[type];
    if (!nodeDef) {
        throw new Error(`Unknown node type: ${type}`);
    }
    return {
        id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: type,
        label: nodeDef.label,
        position: { x, y },
        config: JSON.parse(JSON.stringify(nodeDef.config)), // Deep copy
        inputs: nodeDef.inputs,
        outputs: nodeDef.outputs,
        color: nodeDef.color,
    };
}
