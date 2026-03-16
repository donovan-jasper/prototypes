import { impedanceRules, powerRules, connectionRules } from './rules';

export const checkCompatibility = (components) => {
  const issues = [];

  // Check impedance compatibility
  components.forEach((component, index) => {
    if (component.category === 'receiver') {
      components.forEach((speaker, speakerIndex) => {
        if (speaker.category === 'speaker' && speaker.impedance < component.impedance) {
          issues.push({
            type: 'impedance',
            severity: 'warning',
            message: impedanceRules.receiver.speaker.message,
            affectedComponents: [index, speakerIndex],
          });
        }
      });
    }
  });

  // Check power compatibility
  components.forEach((component, index) => {
    if (component.category === 'receiver') {
      components.forEach((speaker, speakerIndex) => {
        if (speaker.category === 'speaker' && speaker.power > component.power * powerRules.receiver.speaker.max) {
          issues.push({
            type: 'power',
            severity: 'error',
            message: powerRules.receiver.speaker.message,
            affectedComponents: [index, speakerIndex],
          });
        }
      });
    }
  });

  // Check connection compatibility
  components.forEach((component, index) => {
    if (component.category === 'receiver') {
      components.forEach((speaker, speakerIndex) => {
        if (speaker.category === 'speaker' && !speaker.connections.some(conn => connectionRules.receiver.speaker.required.includes(conn))) {
          issues.push({
            type: 'connection',
            severity: 'error',
            message: connectionRules.receiver.speaker.message,
            affectedComponents: [index, speakerIndex],
          });
        }
      });
    }
  });

  return issues;
};
