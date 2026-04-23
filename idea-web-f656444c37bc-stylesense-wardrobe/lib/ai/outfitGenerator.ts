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

  // Generate possible outfit combinations
  const combinations = generateCombinations(availableItems, context);

  // Score and sort combinations
  const scoredCombinations = combinations.map(combination => ({
    ...combination,
    score: calculateOutfitScore(combination.items, availableItems, context)
  }));

  // Sort by score (highest first)
  scoredCombinations.sort((a, b) => b.score - a.score);

  // Return top 5 suggestions
  return scoredCombinations.slice(0, 5).map(combination => ({
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
    // Hot weather (above 75°F)
    if (context.temp > 75) {
      return !item.tags.includes('winter') &&
             !item.tags.includes('heavy') &&
             !item.tags.includes('formal');
    }
    // Cold weather (below 50°F)
    else if (context.temp < 50) {
      return !item.tags.includes('summer') &&
             !item.tags.includes('light') &&
             !item.tags.includes('casual');
    }
    // Mild weather
    return true;
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

  // Base score based on number of items
  score += items.length * 2;

  // Color harmony score
  const colorScore = calculateColorHarmonyScore(items);
  score += colorScore * 3;

  // Style coherence score
  const styleScore = calculateStyleCoherenceScore(items, context);
  score += styleScore * 2;

  // Weather appropriateness score
  const weatherScore = calculateWeatherAppropriatenessScore(items, context);
  score += weatherScore * 2;

  // Occasion appropriateness score
  const occasionScore = calculateOccasionAppropriatenessScore(items, context);
  score += occasionScore * 2;

  return score;
}

function calculateColorHarmonyScore(items: WardrobeItem[]): number {
  if (items.length < 2) return 0;

  // Check for monochrome (all items same color)
  const firstColors = items[0].colors;
  const isMonochrome = items.every(item =>
    item.colors.some(color => firstColors.includes(color))
  );

  if (isMonochrome) return 5;

  // Check for complementary colors
  let hasComplementary = false;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1Colors = items[i].colors;
      const item2Colors = items[j].colors;

      for (const color1 of item1Colors) {
        if (COMPLEMENTARY_COLORS[color1]?.some(color =>
          item2Colors.includes(color)
        )) {
          hasComplementary = true;
          break;
        }
      }
    }
  }

  if (hasComplementary) return 4;

  // Check for analogous colors
  let hasAnalogous = false;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1Colors = items[i].colors;
      const item2Colors = items[j].colors;

      for (const color1 of item1Colors) {
        if (ANALOGOUS_COLORS[color1]?.some(color =>
          item2Colors.includes(color)
        )) {
          hasAnalogous = true;
          break;
        }
      }
    }
  }

  if (hasAnalogous) return 3;

  // Default score for mixed colors
  return 2;
}

function calculateStyleCoherenceScore(
  items: WardrobeItem[],
  context: GenerationContext
): number {
  const isFormal = context.events.some(event =>
    event.toLowerCase().includes('meeting') ||
    event.toLowerCase().includes('interview') ||
    event.toLowerCase().includes('dinner')
  );

  const isCasual = context.events.some(event =>
    event.toLowerCase().includes('brunch') ||
    event.toLowerCase().includes('coffee') ||
    event.toLowerCase().includes('lunch')
  );

  // Check if all items match the occasion
  const allFormal = items.every(item =>
    item.tags.includes('formal') ||
    item.tags.includes('work') ||
    item.tags.includes('business')
  );

  const allCasual = items.every(item =>
    item.tags.includes('casual') ||
    item.tags.includes('athleisure') ||
    item.tags.includes('streetwear')
  );

  if (isFormal && allFormal) return 5;
  if (isCasual && allCasual) return 5;

  // Mixed styles get lower score
  return 3;
}

function calculateWeatherAppropriatenessScore(
  items: WardrobeItem[],
  context: GenerationContext
): number {
  // Check if all items are appropriate for the weather
  const allAppropriate = items.every(item => {
    if (context.temp > 75) {
      return !item.tags.includes('winter') &&
             !item.tags.includes('heavy') &&
             !item.tags.includes('formal');
    } else if (context.temp < 50) {
      return !item.tags.includes('summer') &&
             !item.tags.includes('light') &&
             !item.tags.includes('casual');
    }
    return true;
  });

  return allAppropriate ? 5 : 3;
}

function calculateOccasionAppropriatenessScore(
  items: WardrobeItem[],
  context: GenerationContext
): number {
  const isFormal = context.events.some(event =>
    event.toLowerCase().includes('meeting') ||
    event.toLowerCase().includes('interview') ||
    event.toLowerCase().includes('dinner')
  );

  const isCasual = context.events.some(event =>
    event.toLowerCase().includes('brunch') ||
    event.toLowerCase().includes('coffee') ||
    event.toLowerCase().includes('lunch')
  );

  // Check if items match the occasion
  if (isFormal) {
    const hasFormal = items.some(item =>
      item.tags.includes('formal') ||
      item.tags.includes('work') ||
      item.tags.includes('business')
    );
    return hasFormal ? 5 : 3;
  }

  if (isCasual) {
    const hasCasual = items.some(item =>
      item.tags.includes('casual') ||
      item.tags.includes('athleisure') ||
      item.tags.includes('streetwear')
    );
    return hasCasual ? 5 : 3;
  }

  // Neutral occasions get higher score
  return 4;
}
