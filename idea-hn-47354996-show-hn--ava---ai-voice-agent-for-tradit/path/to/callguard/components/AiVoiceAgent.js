import React, { useState, useEffect } from 'react';
import { TextToSpeech } from 'expo-speech';

const AiVoiceAgent = {
  init: () => {
    // Initialize the AI voice agent
    TextToSpeech.getAvailableVoicesAsync().then((voices) => {
      console.log(voices);
    });
  },

  respond: (text) => {
    // Use the AI voice agent to respond to the call
    TextToSpeech.speak(text);
  },
};

export default AiVoiceAgent;
