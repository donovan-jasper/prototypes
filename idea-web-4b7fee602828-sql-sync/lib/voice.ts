const parseVoiceCommand = (transcript) => {
  const lowerTranscript = transcript.toLowerCase();
  if (lowerTranscript.startsWith('add')) {
    const fields = transcript.substring(3).trim().split(',').map(field => field.trim());
    return { action: 'add', fields };
  } else if (lowerTranscript.startsWith('show')) {
    return { action: 'query', query: transcript.substring(4).trim() };
  }
  return { action: 'unknown' };
};

export { parseVoiceCommand };
