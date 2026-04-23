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

  // Return top 3-5 suggestions
  const maxSuggestions = Math.min(5, Math.max(3, scoredCombinations.length));
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
    // Hot weather (above 75°F)
    if (context.temp > 75) {
      return !['outerwear', 'heavy'].some(tag => item.tags.includes(tag));
    }
    // Cold weather (below 50°F)
    else if (context.temp < 50) {
      return !['light', 'summer'].some(tag => item.tags.includes(tag));
    }
    // Moderate weather
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

  // Color harmony bonus
  const primaryColors = items.flatMap(item => item.colors.slice(0, 1));
  if (primaryColors.length > 1) {
    const color1 = primaryColors[0];
    const color2 = primaryColors[1];

    if (COMPLEMENTARY_COLORS[color1]?.includes(color2)) {
      score += 5; // Complementary colors
    } else if (ANALOGOUS_COLORS[color1]?.includes(color2)) {
      score += 3; // Analogous colors
    } else if (color1 === color2) {
      score += 2; // Monochromatic
    }
  }

  // Weather appropriateness
  if (context.temp > 75 && !items.some(item => ['outerwear', 'heavy'].some(tag => item.tags.includes(tag)))) {
    score += 3;
  } else if (context.temp < 50 && items.some(item => ['warm', 'insulated'].some(tag => item.tags.includes(tag)))) {
    score += 3;
  }

  // Occasion appropriateness
  const isFormal = context.events.some(event =>
    event.toLowerCase().includes('meeting') ||
    event.toLowerCase().includes('interview') ||
    event.toLowerCase().includes('dinner')
  );

  if (isFormal && items.some(item => ['formal', 'business'].some(tag => item.tags.includes(tag)))) {
    score += 4;
  } else if (!isFormal && items.some(item => ['casual', 'everyday'].some(tag => item.tags.includes(tag)))) {
    score += 2;
  }

  return score;
}
