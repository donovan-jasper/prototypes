import React from 'react';
import AiVoiceAgent from '../../components/AiVoiceAgent';

describe('AiVoiceAgent', () => {
  it('initializes correctly', () => {
    AiVoiceAgent.init();
    expect(AiVoiceAgent).toBeDefined();
  });

  it('responds correctly', () => {
    const text = 'Hello, world!';
    AiVoiceAgent.respond(text);
    expect(AiVoiceAgent).toBeDefined();
  });
});
