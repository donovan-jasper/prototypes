// Mock AI service that parses script text into structured scene data
// This version simulates the generation of actual visual assets (mock image URLs)

// Helper functions for generating mock image URLs
const LOREM_PICSUM_BASE = 'https://picsum.photos';
const CHARACTER_IMAGE_DIMENSIONS = '150/150'; // Width/Height for character images

const getBackgroundMockImageUrl = (backgroundType, seed = Math.random()) => {
  // Map background types to different Lorem Picsum categories/seeds for variety
  const typeToSeedMap = {
    forest: 'nature',
    beach: 'sea',
    city: 'city',
    indoor: 'architecture',
    mountain: 'mountains',
    school: 'education',
    office: 'business',
    park: 'park',
    night: 'nightlife',
    day: 'daylight',
    neutral: 'abstract',
  };
  const category = typeToSeedMap[backgroundType] || 'any';
  // Use a combination of category and seed for more unique images
  return `${LOREM_PICSUM_BASE}/seed/${category}-${seed}/1280/720`; // Common video resolution
};

const getCharacterMockImageUrl = (characterName, seed = Math.random()) => {
  // Use character name as part of the seed for some consistency, but add random for variety
  const uniqueSeed = `${characterName}-${seed}`;
  return `${LOREM_PICSUM_BASE}/seed/${uniqueSeed}/${CHARACTER_IMAGE_DIMENSIONS}`;
};


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
    const backgroundType = extractBackground(content); // Get the type first
    const characters = extractCharacters(content); // This now returns array of { name, position }
    const visualElements = extractVisualElements(content);
    // const position = extractPosition(content); // REMOVED: positions are now per character
    const duration = calculateSceneDuration(words.length);
    const transition = determineTransition(content);

    // Generate image URLs based on extracted types
    const backgroundImageUrl = getBackgroundMockImageUrl(backgroundType, scene.number);
    const characterObjectsWithImages = characters.map((charObj, index) => ({
      ...charObj,
      imageUrl: getCharacterMockImageUrl(charObj.name, `${scene.number}-${index}`), // Unique seed for each character in each scene
    }));
    
    return {
      description: scene.content,
      duration,
      backgroundImageUrl, // NEW: Mock image URL for background
      characters: characterObjectsWithImages, // MODIFIED: Array of { name, imageUrl, position }
      visualElements, // Still present in data, but not rendered in VideoPreview for this task
      transition
    };
  });

  return processedScenes;
};

const extractCharacters = (content) => {
  // Simple character extraction based on common character indicators
  const characterPatterns = [
    /\b(\w+)\s+(walks|runs|jumps|talks|says|stands)\b/gi,
    /\b(\w+)\s+(is|was|seems)\s+(happy|sad|angry|excited|calm)\b/gi,
    /\b(character|person|man|woman|boy|girl|child)\s+(\w+)\b/gi,
    /\b(cat|dog|robot|bird|alien|wizard|knight|dragon|fairy)\b/gi // Added more specific character types
  ];
  
  const uniqueCharacterNames = new Set();
  
  characterPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      // Prioritize specific character names or the first word if it's not a verb/adjective
      const matchedChar = match[1] || match[2];
      if (matchedChar && !/\b(walks|runs|jumps|talks|says|stands|is|was|seems|happy|sad|angry|excited|calm|character|person|man|woman|boy|girl|child)\b/.test(matchedChar)) {
        uniqueCharacterNames.add(matchedChar.toLowerCase());
      }
    }
  });

  // If no specific characters, add a generic 'person' if the scene implies one
  if (uniqueCharacterNames.size === 0 && (content.includes('a person') || content.includes('someone') || content.includes('they'))) {
    uniqueCharacterNames.add('person');
  }
  
  // Define a set of possible character positions
  const characterPositions = ['bottom-left', 'bottom-center', 'bottom-right', 'center-left', 'center-right', 'top-left', 'top-right'];

  // Assign a position to each character
  const charactersWithPositions = Array.from(uniqueCharacterNames).slice(0, 3).map((name, index) => ({
    name: name,
    position: characterPositions[index % characterPositions.length] // Assign positions in a round-robin fashion
  }));
  
  return charactersWithPositions;
};

const extractBackground = (content) => {
  // Identify background/setting from common location indicators
  if (content.includes('forest') || content.includes('woods')) return 'forest';
  if (content.includes('beach') || content.includes('ocean') || content.includes('sea')) return 'beach';
  if (content.includes('city') || content.includes('street') || content.includes('urban')) return 'city';
  if (content.includes('house') || content.includes('home') || content.includes('room') || content.includes('indoor')) return 'indoor';
  if (content.includes('mountain') || content.includes('hill') || content.includes('peak')) return 'mountain';
  if (content.includes('school') || content.includes('classroom')) return 'school';
  if (content.includes('office') || content.includes('workplace')) return 'office';
  if (content.includes('park') || content.includes('garden')) return 'park';
  if (content.includes('night') || content.includes('dark') || content.includes('moon')) return 'night';
  if (content.includes('day') || content.includes('sun') || content.includes('sunny')) return 'day';
  
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

// REMOVED: extractPosition is now handled within extractCharacters for individual characters.
// const extractPosition = (content) => {
//   // Determine character positioning
//   if (content.includes('left')) return 'left';
//   if (content.includes('right')) return 'right';
//   if (content.includes('front')) return 'front';
//   if (content.includes('back')) return 'back';
//   if (content.includes('center') || content.includes('middle')) return 'center';
  
//   return 'center'; // Default position
// };

const calculateSceneDuration = (wordCount) => {
  // Calculate duration based on word count, with a min/max
  const wordsPerSecond = 2; // Average reading speed
  const calculatedDuration = wordCount / wordsPerSecond;
  return Math.max(3, Math.min(15, Math.round(calculatedDuration))); // Min 3s, Max 15s
};

const determineTransition = (content) => {
  if (content.includes('fade to black') || content.includes('fades out')) return 'fade';
  if (content.includes('cut to') || content.includes('suddenly')) return 'cut';
  if (content.includes('pan') || content.includes('moves to')) return 'slide';
  
  return 'fade'; // Default transition
};
