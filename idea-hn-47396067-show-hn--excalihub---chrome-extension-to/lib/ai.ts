import { CanvasElement } from '../types/drawing';

interface DiagramResponse {
  elements: CanvasElement[];
}

export async function generateDiagram(prompt: string): Promise<DiagramResponse> {
  // In a real implementation, this would call an AI API
  // For this prototype, we'll simulate the response with basic shapes

  // Simple parsing of the prompt to generate appropriate shapes
  const lowerPrompt = prompt.toLowerCase();

  let elements: CanvasElement[] = [];

  if (lowerPrompt.includes('flowchart') || lowerPrompt.includes('diagram')) {
    // Create a simple flowchart with boxes and arrows
    elements = [
      {
        id: `box-${Date.now()}`,
        type: 'rect',
        x: 100,
        y: 100,
        width: 150,
        height: 80,
        color: '#4CAF50',
        text: 'Start',
        strokeWidth: 2,
      },
      {
        id: `box-${Date.now() + 1}`,
        type: 'rect',
        x: 300,
        y: 100,
        width: 150,
        height: 80,
        color: '#2196F3',
        text: 'Process',
        strokeWidth: 2,
      },
      {
        id: `arrow-${Date.now()}`,
        type: 'line',
        x1: 250,
        y1: 140,
        x2: 300,
        y2: 140,
        color: '#000000',
        strokeWidth: 2,
      },
      {
        id: `box-${Date.now() + 2}`,
        type: 'rect',
        x: 500,
        y: 100,
        width: 150,
        height: 80,
        color: '#FFC107',
        text: 'End',
        strokeWidth: 2,
      },
      {
        id: `arrow-${Date.now() + 1}`,
        type: 'line',
        x1: 450,
        y1: 140,
        x2: 500,
        y2: 140,
        color: '#000000',
        strokeWidth: 2,
      },
    ];
  } else if (lowerPrompt.includes('mind map') || lowerPrompt.includes('brainstorm')) {
    // Create a simple mind map with a central circle and branches
    elements = [
      {
        id: `center-${Date.now()}`,
        type: 'circle',
        x: 300,
        y: 200,
        radius: 80,
        color: '#FF5722',
        text: 'Main Idea',
        strokeWidth: 2,
      },
      {
        id: `branch-${Date.now()}`,
        type: 'line',
        x1: 300,
        y1: 280,
        x2: 200,
        y2: 380,
        color: '#000000',
        strokeWidth: 2,
      },
      {
        id: `idea-${Date.now()}`,
        type: 'rect',
        x: 100,
        y: 350,
        width: 150,
        height: 60,
        color: '#9C27B0',
        text: 'Sub Idea 1',
        strokeWidth: 2,
      },
      {
        id: `branch-${Date.now() + 1}`,
        type: 'line',
        x1: 300,
        y1: 280,
        x2: 400,
        y2: 380,
        color: '#000000',
        strokeWidth: 2,
      },
      {
        id: `idea-${Date.now() + 1}`,
        type: 'rect',
        x: 350,
        y: 350,
        width: 150,
        height: 60,
        color: '#9C27B0',
        text: 'Sub Idea 2',
        strokeWidth: 2,
      },
    ];
  } else if (lowerPrompt.includes('org chart') || lowerPrompt.includes('team')) {
    // Create a simple org chart with boxes and connecting lines
    elements = [
      {
        id: `ceo-${Date.now()}`,
        type: 'rect',
        x: 300,
        y: 100,
        width: 150,
        height: 80,
        color: '#E91E63',
        text: 'CEO',
        strokeWidth: 2,
      },
      {
        id: `manager-${Date.now()}`,
        type: 'rect',
        x: 150,
        y: 250,
        width: 150,
        height: 80,
        color: '#3F51B5',
        text: 'Manager 1',
        strokeWidth: 2,
      },
      {
        id: `manager-${Date.now() + 1}`,
        type: 'rect',
        x: 450,
        y: 250,
        width: 150,
        height: 80,
        color: '#3F51B5',
        text: 'Manager 2',
        strokeWidth: 2,
      },
      {
        id: `line-${Date.now()}`,
        type: 'line',
        x1: 375,
        y1: 180,
        x2: 225,
        y2: 250,
        color: '#000000',
        strokeWidth: 2,
      },
      {
        id: `line-${Date.now() + 1}`,
        type: 'line',
        x1: 375,
        y1: 180,
        x2: 525,
        y2: 250,
        color: '#000000',
        strokeWidth: 2,
      },
    ];
  } else {
    // Default to a simple rectangle and circle
    elements = [
      {
        id: `rect-${Date.now()}`,
        type: 'rect',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        color: '#FF5722',
        text: 'Rectangle',
        strokeWidth: 2,
      },
      {
        id: `circle-${Date.now()}`,
        type: 'circle',
        x: 400,
        y: 200,
        radius: 80,
        color: '#4CAF50',
        text: 'Circle',
        strokeWidth: 2,
      },
    ];
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { elements };
}
