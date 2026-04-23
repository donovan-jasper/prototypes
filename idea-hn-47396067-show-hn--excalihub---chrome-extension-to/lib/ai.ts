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
        id: 'box1',
        type: 'rect',
        x: 100,
        y: 100,
        width: 150,
        height: 80,
        color: '#4CAF50',
        text: 'Start',
      },
      {
        id: 'box2',
        type: 'rect',
        x: 300,
        y: 100,
        width: 150,
        height: 80,
        color: '#2196F3',
        text: 'Process',
      },
      {
        id: 'arrow1',
        type: 'line',
        x1: 250,
        y1: 140,
        x2: 300,
        y2: 140,
        color: '#000000',
        strokeWidth: 2,
      },
      {
        id: 'box3',
        type: 'rect',
        x: 500,
        y: 100,
        width: 150,
        height: 80,
        color: '#FFC107',
        text: 'End',
      },
      {
        id: 'arrow2',
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
        id: 'center',
        type: 'circle',
        x: 300,
        y: 200,
        radius: 80,
        color: '#FF5722',
        text: 'Main Idea',
      },
      {
        id: 'branch1',
        type: 'line',
        x1: 300,
        y1: 280,
        x2: 200,
        y2: 380,
        color: '#000000',
        strokeWidth: 2,
      },
      {
        id: 'idea1',
        type: 'rect',
        x: 100,
        y: 350,
        width: 150,
        height: 60,
        color: '#9C27B0',
        text: 'Sub Idea 1',
      },
      {
        id: 'branch2',
        type: 'line',
        x1: 300,
        y1: 280,
        x2: 400,
        y2: 380,
        color: '#000000',
        strokeWidth: 2,
      },
      {
        id: 'idea2',
        type: 'rect',
        x: 350,
        y: 350,
        width: 150,
        height: 60,
        color: '#9C27B0',
        text: 'Sub Idea 2',
      },
    ];
  } else if (lowerPrompt.includes('org chart') || lowerPrompt.includes('team')) {
    // Create a simple org chart with boxes and connecting lines
    elements = [
      {
        id: 'ceo',
        type: 'rect',
        x: 300,
        y: 100,
        width: 150,
        height: 80,
        color: '#E91E63',
        text: 'CEO',
      },
      {
        id: 'manager1',
        type: 'rect',
        x: 150,
        y: 250,
        width: 150,
        height: 80,
        color: '#3F51B5',
        text: 'Manager 1',
      },
      {
        id: 'manager2',
        type: 'rect',
        x: 450,
        y: 250,
        width: 150,
        height: 80,
        color: '#3F51B5',
        text: 'Manager 2',
      },
      {
        id: 'line1',
        type: 'line',
        x1: 375,
        y1: 180,
        x2: 225,
        y2: 250,
        color: '#000000',
        strokeWidth: 2,
      },
      {
        id: 'line2',
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
        id: 'rect1',
        type: 'rect',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        color: '#FF5722',
        text: 'Rectangle',
      },
      {
        id: 'circle1',
        type: 'circle',
        x: 400,
        y: 200,
        radius: 80,
        color: '#4CAF50',
        text: 'Circle',
      },
    ];
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { elements };
}
