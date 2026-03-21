import { parseScriptWithAI } from './aiService';

export const processScriptToVideo = async (script) => {
  if (!script || script.trim() === '') {
    return { scenes: [] };
  }

  try {
    // Parse the script using AI service
    const parsedScenes = await parseScriptWithAI(script);
    
    // Process each scene to add default values and structure
    const processedScenes = parsedScenes.map((scene, index) => ({
      id: `scene_${index + 1}`,
      description: scene.description || '',
      duration: scene.duration || 5000, // Default 5 seconds
      background: scene.background || 'neutral',
      characters: scene.characters || [],
      visualElements: scene.visualElements || [],
      position: scene.position || 'center',
      transition: scene.transition || 'fade'
    }));

    return {
      scenes: processedScenes,
      totalDuration: processedScenes.reduce((sum, scene) => sum + scene.duration, 0),
      sceneCount: processedScenes.length
    };
  } catch (error) {
    console.error('Error processing script to video:', error);
    // Return fallback structure in case of error
    return {
      scenes: [{
        id: 'scene_1',
        description: script.substring(0, 100) + (script.length > 100 ? '...' : ''),
        duration: 5000,
        background: 'neutral',
        characters: [],
        visualElements: [],
        position: 'center',
        transition: 'fade'
      }],
      totalDuration: 5000,
      sceneCount: 1
    };
  }
};

export const splitScriptIntoScenes = (script) => {
  // Split script by scene markers like "Scene 1:", "SCENE 1:", "Scene 2:", etc.
  const sceneRegex = /(?:^|\n)(?:Scene|SCENE)\s+(\d+):?\s*(.*?)(?=\n(?:Scene|SCENE)\s+\d+:|$)/gi;
  const matches = [];
  let match;

  while ((match = sceneRegex.exec(script)) !== null) {
    matches.push({
      number: parseInt(match[1]),
      content: match[2].trim()
    });
  }

  // If no scene markers found, treat entire script as one scene
  if (matches.length === 0) {
    return [{
      number: 1,
      content: script.trim()
    }];
  }

  return matches;
};
