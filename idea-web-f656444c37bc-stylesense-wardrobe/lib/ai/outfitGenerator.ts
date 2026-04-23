import { WardrobeItem, OutfitSuggestion, Category } from '@/types';
import { getWearLogForLastDays } from '@/lib/database';

interface GenerationContext {
  weather: string;
  temp: number;
  events: string[];
}

interface OutfitCombination {
  items: number[];
  score: number;
  context: GenerationContext;
}

// Color harmony definitions
const COMPLEMENTARY_COLORS: Record<string, string[]> = {
  '#FF0000': ['#00FFFF', '#0000FF'], // Red with cyan/blue
  '#00FF00': ['#FF00FF', '#0000FF'], // Green with magenta/blue
  '#0000FF': ['#FFFF00', '#FF0000'], // Blue with yellow/red
  '#FFFF00': ['#00FFFF', '#0000FF'], // Yellow with cyan/blue
  '#FF00FF': ['#00FF00', '#0000FF'], // Magenta with green/blue
  '#00FFFF': ['#FF00FF', '#FF0000'], // Cyan with magenta/red
};

const ANALOGOUS_COLORS: Record<string, string[]> = {
  '#FF0000': ['#FF8000', '#FF0080'], // Red with orange/pink
  '#00FF00': ['#80FF00', '#00FF80'], // Green with lime/teal
  '#0000FF': ['#8000FF', '#0080FF'], // Blue with purple/light blue
  '#FFFF00': ['#FF8000', '#80FF00'], // Yellow with orange/lime
  '#FF00FF': ['#FF8000', '#8000FF'], // Magenta with orange/purple
  '#00FFFF': ['#00FF80', '#0080FF'], // Cyan with teal/light blue
};

export async function generateOutfits(
  items: WardrobeItem[],
  context: GenerationContext
): Promise<OutfitSuggestion[]> {
  // Get recently worn items to avoid repeats
  const recentlyWorn = await getWearLogForLastDays(7);
  const wornItemIds = new Set(recentlyWorn.flatMap(entry => entry.itemIds));

  // Filter items that haven't been worn recently
  const availableItems = items.filter(item => !wornItemIds.has(item.id));

  if (availableItems.length === 0) {
    return []; // Return empty array if no items available
  }

  // Generate possible outfit combinations
  const combinations = generateCombinations(availableItems, context);

  if (combinations.length === 0) {
    return []; // Return empty array if no combinations found
  }

  // Score and sort combinations
  const scoredCombinations = combinations.map(combination => ({
    ...combination,
    score: calculateOutfitScore(combination.items, availableItems, context)
  }));

  // Sort by score (highest first)
  scoredCombinations.sort((a, b) => b.score - a.score);

  // Return top 5 suggestions
  const maxSuggestions = Math.min(5, scoredCombinations.length);
  return scoredCombinations.slice(0, maxSuggestions).map(combination => ({
    items: combination.items,
    score: combination.score,
    context: combination.context
  }));
}

function generateCombinations(
  items: WardrobeItem[],
  context: GenerationContext
): OutfitCombination[] {
  const combinations: OutfitCombination[] = [];

  // Filter items appropriate for the weather
  const weatherFiltered = filterByWeather(items, context);

  // Group by category
  const grouped = groupByCategory(weatherFiltered);

  // Generate combinations based on occasion
  const isFormal = context.events.some(event =>
    event.toLowerCase().includes('meeting') ||
    event.toLowerCase().includes('interview') ||
    event.toLowerCase().includes('dinner')
  );

  // For formal occasions, prefer dress + accessories
  if (isFormal && grouped.dress.length > 0) {
    // Dress combinations
    for (const dress of grouped.dress) {
      // Add accessories if available
      if (grouped.accessory.length > 0) {
        for (const accessory of grouped.accessory) {
          combinations.push({
            items: [dress.id, accessory.id],
            score: 0,
            context
          });
        }
      } else {
        combinations.push({
          items: [dress.id],
          score: 0,
          context
        });
      }
    }
  }

  // For casual or mixed occasions, prefer top + bottom combinations
  if (!isFormal || combinations.length < 3) {
    // Top + bottom combinations
    for (const top of grouped.top) {
      for (const bottom of grouped.bottom) {
        combinations.push({
          items: [top.id, bottom.id],
          score: 0,
          context
        });

        // Add shoes if available
        if (grouped.shoes.length > 0) {
          for (const shoes of grouped.shoes) {
            combinations.push({
              items: [top.id, bottom.id, shoes.id],
              score: 0,
              context
            });
          }
        }
      }
    }
  }

  // Add outerwear if needed (cold weather)
  if (context.temp < 50 && grouped.outerwear.length > 0) {
    const outerwearCombinations: OutfitCombination[] = [];

    for (const combo of combinations) {
      for (const outerwear of grouped.outerwear) {
        outerwearCombinations.push({
          items: [...combo.items, outerwear.id],
          score: 0,
          context
        });
      }
    }

    combinations.push(...outerwearCombinations);
  }

  return combinations;
}

function filterByWeather(
  items: WardrobeItem[],
  context: GenerationContext
): WardrobeItem[] {
  return items.filter(item => {
    // Hot weather (above 70°F)
    if (context.temp > 70) {
      return !item.tags.includes('winter') &&
             !item.tags.includes('formal') &&
             !item.tags.includes('heavy');
    }
    // Cold weather (below 50°F)
    else if (context.temp < 50) {
      return !item.tags.includes('summer') &&
             !item.tags.includes('casual') &&
             !item.tags.includes('light');
    }
    // Mild weather (50-70°F)
    else {
      return !item.tags.includes('extreme');
    }
  });
}

function groupByCategory(items: WardrobeItem[]): Record<Category, WardrobeItem[]> {
  const grouped: Record<Category, WardrobeItem[]> = {
    top: [],
    bottom: [],
    dress: [],
    outerwear: [],
    shoes: [],
    accessory: []
  };

  items.forEach(item => {
    if (grouped[item.category]) {
      grouped[item.category].push(item);
    }
  });

  return grouped;
}

function calculateOutfitScore(
  itemIds: number[],
  allItems: WardrobeItem[],
  context: GenerationContext
): number {
  let score = 0;
  const items = allItems.filter(item => itemIds.includes(item.id));

  // Check if outfit has required pieces
  const hasTop = items.some(item => item.category === 'top');
  const hasBottom = items.some(item => item.category === 'bottom');
  const hasDress = items.some(item => item.category === 'dress');

  if (hasDress || (hasTop && hasBottom)) {
    score += 50; // Complete outfit gets base score
  } else {
    score -= 30; // Penalize incomplete outfits
  }

  // Check color harmony
  const dominantColors = items.flatMap(item => item.colors);
  const colorScore = calculateColorHarmonyScore(dominantColors);
  score += colorScore * 20; // Color harmony contributes 20% to score

  // Check style preferences
  const styleScore = calculateStylePreferenceScore(items, context);
  score += styleScore * 15; // Style preference contributes 15% to score

  // Check weather appropriateness
  const weatherScore = calculateWeatherAppropriatenessScore(items, context);
  score += weatherScore * 15; // Weather appropriateness contributes 15% to score

  // Normalize score to 0-100 range
  return Math.max(0, Math.min(100, score));
}

function calculateColorHarmonyScore(colors: string[]): number {
  if (colors.length < 2) return 1; // Single color is always harmonious

  let harmonyScore = 0;

  // Check for complementary colors
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const color1 = colors[i];
      const color2 = colors[j];

      if (COMPLEMENTARY_COLORS[color1]?.includes(color2) ||
          COMPLEMENTARY_COLORS[color2]?.includes(color1)) {
        harmonyScore += 0.5;
      }

      if (ANALOGOUS_COLORS[color1]?.includes(color2) ||
          ANALOGOUS_COLORS[color2]?.includes(color1)) {
        harmonyScore += 0.3;
      }
    }
  }

  // Normalize score (0-1)
  return Math.min(1, harmonyScore / (colors.length * 0.5));
}

function calculateStylePreferenceScore(
  items: WardrobeItem[],
  context: GenerationContext
): number {
  let styleScore = 0;

  // Check if outfit matches event style
  const isFormalEvent = context.events.some(event =>
    event.toLowerCase().includes('meeting') ||
    event.toLowerCase().includes('interview') ||
    event.toLowerCase().includes('dinner')
  );

  const formalItems = items.filter(item =>
    item.tags.includes('formal') ||
    item.tags.includes('work') ||
    item.tags.includes('business')
  );

  const casualItems = items.filter(item =>
    item.tags.includes('casual') ||
    item.tags.includes('athleisure') ||
    item.tags.includes('streetwear')
  );

  if (isFormalEvent) {
    // Formal events should have more formal items
    styleScore += formalItems.length * 0.3;
    styleScore -= casualItems.length * 0.2;
  } else {
    // Casual events should have more casual items
    styleScore += casualItems.length * 0.3;
    styleScore -= formalItems.length * 0.2;
  }

  // Normalize score (0-1)
  return Math.max(0, Math.min(1, styleScore));
}

function calculateWeatherAppropriatenessScore(
  items: WardrobeItem[],
  context: GenerationContext
): number {
  let weatherScore = 0;

  // Check if items are appropriate for the weather
  items.forEach(item => {
    if (context.temp > 70 && item.tags.includes('summer')) {
      weatherScore += 0.2;
    } else if (context.temp < 50 && item.tags.includes('winter')) {
      weatherScore += 0.2;
    } else if (context.temp > 50 && context.temp < 70 && item.tags.includes('spring') || item.tags.includes('fall')) {
      weatherScore += 0.2;
    }
  });

  // Normalize score (0-1)
  return Math.min(1, weatherScore / items.length);
}
