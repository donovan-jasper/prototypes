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
        summary: "John is calling about the project update. Key points: timeline, budget constraints, client deadline by Friday.",
        confidence: 0.85
      },
      "unknown": {
        transcript: "Hello, this is a generic call. I'm calling to discuss some important information.",
        summary: "Unknown caller discussing important information.",
        confidence: 0.65
      },
      "mom": {
        transcript: "Hi, this is your mom. Just checking in. How's everything going?",
        summary: "Motherly call - casual check-in about daily life.",
        confidence: 0.92
      },
      "bank": {
        transcript: "This is the bank. We've noticed unusual activity on your account. Please verify your information.",
        summary: "Bank call - account security verification required.",
        confidence: 0.78
      },
      "sales": {
        transcript: "Hello, this is Sarah from XYZ Insurance. I wanted to discuss your current policy and see if there are any better options available.",
        summary: "This is a sales call about your insurance policy. The caller is offering to discuss policy options.",
        confidence: 0.88
      },
      "tech": {
        transcript: "Hi, this is the tech support team. We've detected some issues with your account. Please hold while we transfer you.",
        summary: "Technical support call regarding account issues. The caller is transferring the call to a specialist.",
        confidence: 0.75
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
        confidence: result.confidence
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
