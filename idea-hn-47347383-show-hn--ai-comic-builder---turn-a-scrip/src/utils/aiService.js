// Mock AI service that parses script text into structured scene data
export const parseScriptWithAI = async (script) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Split script into scenes
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
    matches.push({
      number: 1,
      content: script.trim()
    });
  }

  // Process each scene to extract details
  const processedScenes = matches.map(scene => {
    const content = scene.content.toLowerCase();
    const words = content.split(/\s+/);
    
    // Extract basic information from the scene content
    const characters = extractCharacters(content);
    const background = extractBackground(content);
    const visualElements = extractVisualElements(content);
    const position = extractPosition(content);
    const duration = calculateSceneDuration(words.length);
    
    return {
      description: scene.content,
      duration,
      background,
      characters,
      visualElements,
      position,
      transition: determineTransition(content)
    };
  });

  return processedScenes;
};

const extractCharacters = (content) => {
  // Simple character extraction based on common character indicators
  const characterPatterns = [
    /\b(\w+)\s+(walks|runs|jumps|talks|says|stands)\b/gi,
    /\b(\w+)\s+(is|was|seems)\s+(happy|sad|angry|excited|calm)\b/gi,
    /\b(character|person|man|woman|boy|girl|child)\s+(\w+)\b/gi
  ];
  
  const characters = new Set();
  
  characterPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        characters.add(match[1]);
      }
      if (match[2] && !/\b(happy|sad|angry|excited|calm|walks|runs|jumps|talks|says|stands|is|was|seems|character|person|man|woman|boy|girl|child)\b/.test(match[2])) {
        characters.add(match[2]);
      }
    }
  });
  
  return Array.from(characters).slice(0, 3); // Limit to 3 main characters
};

const extractBackground = (content) => {
  // Identify background/setting from common location indicators
  if (content.includes('forest') || content.includes('woods')) return 'forest';
  if (content.includes('beach') || content.includes('ocean') || content.includes('sea')) return 'beach';
  if (content.includes('city') || content.includes('street') || content.includes('urban')) return 'city';
  if (content.includes('house') || content.includes('home') || content.includes('room')) return 'indoor';
  if (content.includes('mountain') || content.includes('hill') || content.includes('peak')) return 'mountain';
  if (content.includes('school') || content.includes('classroom')) return 'school';
  if (content.includes('office') || content.includes('workplace')) return 'office';
  if (content.includes('park') || content.includes('garden')) return 'park';
  if (content.includes('night') || content.includes('dark')) return 'night';
  if (content.includes('day') || content.includes('sun')) return 'day';
  
  return 'neutral'; // Default background
};

const extractVisualElements = (content) => {
  // Identify objects and visual elements in the scene
  const visualElements = [];
  
  if (content.includes('tree') || content.includes('trees')) visualElements.push('tree');
  if (content.includes('flower') || content.includes('flowers')) visualElements.push('flower');
  if (content.includes('car') || content.includes('vehicle')) visualElements.push('car');
  if (content.includes('building') || content.includes('buildings')) visualElements.push('building');
  if (content.includes('water') || content.includes('river') || content.includes('lake')) visualElements.push('water');
  if (content.includes('sun') || content.includes('light')) visualElements.push('sun');
  if (content.includes('moon') || content.includes('stars')) visualElements.push('moon');
  if (content.includes('animal') || content.includes('dog') || content.includes('cat')) visualElements.push('animal');
  if (content.includes('book') || content.includes('books')) visualElements.push('book');
  if (content.includes('chair') || content.includes('table')) visualElements.push('furniture');
  
  return visualElements.slice(0, 5); // Limit to 5 visual elements
};

const extractPosition = (content) => {
  // Determine character positioning
  if (content.includes('left')) return 'left';
  if (content.includes('right')) return 'right';
  if (content.includes('front')) return 'front';
  if (content.includes('back')) return 'back';
  if (content.includes('center') || content.includes('middle')) return 'center';
  
  return 'center'; // Default position
};

const calculateSceneDuration = (wordCount) => {
  // Calculate duration based on word count (average reading speed ~200 wpm)
  // Each scene gets at least 3 seconds, max 15 seconds
  const estimatedSeconds = Math.min(Math.max(wordCount / 3, 3), 15);
  return Math.round(estimatedSeconds * 1000); // Convert to milliseconds
};

const determineTransition = (content) => {
  // Determine transition type based on scene content
  if (content.includes('suddenly') || content.includes('quickly')) return 'flash';
  if (content.includes('slowly') || content.includes('gradually')) return 'fade';
  if (content.includes('time jump') || content.includes('later')) return 'wipe';
  
  return 'fade'; // Default transition
};
