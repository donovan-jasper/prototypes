import { validateImpedance } from './impedance';
import { validatePower } from './power';
import { validateConnections } from './connections';
import { Component } from '../types';

interface ValidationIssue {
  type: 'impedance' | 'power' | 'connection' | 'missing_component' | 'ground_loop' | 'cable_length';
  severity: 'error' | 'warning';
  message: string;
  componentIndices: number[];
}

export const validateSignalChain = (components: Component[]): {
  isValid: boolean;
  suggestions: string[];
  issues: ValidationIssue[];
} => {
  let isValid = true;
  const suggestions: string[] = [];
  const issues: ValidationIssue[] = [];

  // Check for empty chain
  if (components.length === 0) {
    return { isValid: true, suggestions: [], issues: [] };
  }

  // Check for missing source
  const firstComponent = components[0];
  if (!['turntable', 'streamer', 'cd_player', 'tuner'].includes(firstComponent.type)) {
    isValid = false;
    suggestions.push('Add a source component (turntable, streamer, etc.) at the beginning');
    issues.push({
      type: 'missing_component',
      severity: 'error',
      message: 'Missing source component at the beginning of the chain',
      componentIndices: [0],
    });
  }

  // Check for missing speakers at the end
  const lastComponent = components[components.length - 1];
  if (lastComponent.type !== 'speaker') {
    isValid = false;
    suggestions.push('Add speakers at the end of the chain');
    issues.push({
      type: 'missing_component',
      severity: 'error',
      message: 'Missing speakers at the end of the chain',
      componentIndices: [components.length - 1],
    });
  }

  // Validate each pair of components
  for (let i = 0; i < components.length - 1; i++) {
    const current = components[i];
    const next = components[i + 1];

    // Validate connections
    if (current.specs.outputs && next.specs.inputs) {
      const connectionStatus = validateConnections(current.specs.outputs, next.specs.inputs);
      if (connectionStatus === 'incompatible') {
        isValid = false;
        const message = `Incompatible connection between ${current.name} and ${next.name}`;
        suggestions.push(message);
        issues.push({
          type: 'connection',
          severity: 'error',
          message,
          componentIndices: [i, i + 1],
        });
      }
    }

    // Validate impedance if applicable
    if (current.type === 'amplifier' && next.type === 'speaker') {
      if (next.specs.impedance && current.specs.outputOhms) {
        const impedanceStatus = validateImpedance(
          next.specs.impedance,
          current.specs.outputOhms
        );
        if (impedanceStatus === 'incompatible') {
          isValid = false;
          const message = `Impedance mismatch: ${next.specs.impedance}Ω speaker with ${current.specs.outputOhms}Ω-only amp`;
          suggestions.push(message);
          issues.push({
            type: 'impedance',
            severity: 'error',
            message,
            componentIndices: [i, i + 1],
          });
        } else if (impedanceStatus === 'warning') {
          const message = `Potential impedance mismatch between ${current.name} and ${next.name}`;
          suggestions.push(message);
          issues.push({
            type: 'impedance',
            severity: 'warning',
            message,
            componentIndices: [i, i + 1],
          });
        }
      }
    }

    // Validate power if applicable
    if (current.type === 'amplifier' && next.type === 'speaker') {
      if (current.specs.powerWatts && next.specs.maxPowerWatts) {
        const powerStatus = validatePower(
          current.specs.powerWatts,
          next.specs.maxPowerWatts
        );
        if (powerStatus === 'warning') {
          const message = `Power mismatch: ${current.specs.powerWatts}W amp with ${next.specs.maxPowerWatts}W speaker`;
          suggestions.push(message);
          issues.push({
            type: 'power',
            severity: 'warning',
            message,
            componentIndices: [i, i + 1],
          });
        }
      }
    }

    // Check for missing components
    if (current.type === 'turntable' && next.type !== 'preamp') {
      isValid = false;
      const message = `Missing phono preamp between ${current.name} and ${next.name}`;
      suggestions.push(message);
      issues.push({
        type: 'missing_component',
        severity: 'error',
        message,
        componentIndices: [i, i + 1],
      });
    }

    // Check for ground loop potential
    if (current.specs.grounded === false && next.specs.grounded === false) {
      const message = `Potential ground loop between ${current.name} and ${next.name}`;
      suggestions.push(message);
      issues.push({
        type: 'ground_loop',
        severity: 'warning',
        message,
        componentIndices: [i, i + 1],
      });
    }

    // Check cable length if specified
    if (current.specs.maxCableLength && next.specs.cableLength) {
      if (next.specs.cableLength > current.specs.maxCableLength) {
        const message = `Cable too long: ${next.specs.cableLength}m exceeds ${current.specs.maxCableLength}m max for ${current.name}`;
        suggestions.push(message);
        issues.push({
          type: 'cable_length',
          severity: 'warning',
          message,
          componentIndices: [i, i + 1],
        });
      }
    }
  }

  return { isValid, suggestions, issues };
};
