import { Alert } from 'react-native';

// Mock AI service - in a real app, this would connect to an actual API
const mockAiService = {
  async processCallAudio(audioData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock response based on audio data (in a real app, this would be actual AI processing)
    const mockResponses = {
      "john": {
        transcript: "Hello, this is John calling about the project update. We need to discuss the timeline and budget constraints. The client is expecting a response by Friday.",
        summary: "John is calling about the project update. Key points: timeline, budget constraints, client deadline by Friday."
      },
      "unknown": {
        transcript: "Hello, this is a generic call. I'm calling to discuss some important information.",
        summary: "Unknown caller discussing important information."
      },
      "mom": {
        transcript: "Hi, this is your mom. Just checking in. How's everything going?",
        summary: "Motherly call - casual check-in about daily life."
      },
      "bank": {
        transcript: "This is the bank. We've noticed unusual activity on your account. Please verify your information.",
        summary: "Bank call - account security verification required."
      }
    };

    // Determine which mock response to use based on caller ID
    const callerId = audioData.callerId?.toLowerCase() || 'unknown';
    return mockResponses[callerId] || mockResponses.unknown;
  }
};

const callScreeningService = {
  async screenCall(callData) {
    try {
      // In a real app, this would capture actual audio from the call
      const audioData = {
        callerId: callData.callerId,
        // In a real implementation, this would contain actual audio samples
        audioSamples: []
      };

      const result = await mockAiService.processCallAudio(audioData);
      return {
        transcript: result.transcript,
        summary: result.summary,
        status: 'completed',
        confidence: Math.random() * 0.5 + 0.5 // Random confidence score between 0.5-1.0
      };
    } catch (error) {
      console.error('Call screening failed:', error);
      Alert.alert('Error', 'Failed to screen the call. Please try again.');
      return {
        transcript: 'Error processing call',
        summary: 'Call screening failed',
        status: 'failed',
        confidence: 0
      };
    }
  }
};

export default callScreeningService;
