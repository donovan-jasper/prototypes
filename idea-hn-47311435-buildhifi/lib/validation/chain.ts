import { validateImpedance } from './impedance';
import { validatePower } from './power';
import { validateConnections } from './connections';

export const validateSignalChain = (components) => {
  let isValid = true;
  const suggestions = [];

  for (let i = 0; i < components.length - 1; i++) {
    const current = components[i];
    const next = components[i + 1];

    // Validate connections
    const connectionStatus = validateConnections(current.outputs, next.inputs);
    if (connectionStatus === 'incompatible') {
      isValid = false;
      suggestions.push(`Incompatible connection between ${current.type} and ${next.type}`);
    }

    // Validate impedance if applicable
    if (current.type === 'amplifier' && next.type === 'speaker') {
      const impedanceStatus = validateImpedance(
        next.specs.impedance,
        current.specs.outputOhms
      );
      if (impedanceStatus === 'incompatible') {
        isValid = false;
        suggestions.push(`Impedance mismatch between ${current.type} and ${next.type}`);
      } else if (impedanceStatus === 'warning') {
        suggestions.push(`Potential impedance mismatch between ${current.type} and ${next.type}`);
      }
    }

    // Validate power if applicable
    if (current.type === 'amplifier' && next.type === 'speaker') {
      const powerStatus = validatePower(
        current.specs.powerWatts,
        next.specs.maxPowerWatts
      );
      if (powerStatus === 'warning') {
        suggestions.push(`Potential power mismatch between ${current.type} and ${next.type}`);
      }
    }

    // Check for missing components
    if (current.type === 'turntable' && next.type !== 'preamp') {
      isValid = false;
      suggestions.push('Add phono preamp between turntable and amplifier');
    }
  }

  return { isValid, suggestions };
};
