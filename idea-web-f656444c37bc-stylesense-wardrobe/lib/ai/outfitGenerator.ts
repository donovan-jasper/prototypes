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
             !item.tags.includes('light');
    }
    // Mild weather
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

  for (const item of items) {
    grouped[item.category].push(item);
  }

  return grouped;
}

function calculateOutfitScore(
  itemIds: number[],
  allItems: WardrobeItem[],
  context: GenerationContext
): number {
  const items = allItems.filter(item => itemIds.includes(item.id));
  let score = 0;

  // Base score based on number of items
  score += items.length * 0.2;

  // Check for complete outfit (top + bottom OR dress)
  const hasTop = items.some(item => item.category === 'top');
  const hasBottom = items.some(item => item.category === 'bottom');
  const hasDress = items.some(item => item.category === 'dress');

  if ((hasTop && hasBottom) || hasDress) {
    score += 0.3;
  }

  // Check color harmony
  const colorScore = calculateColorScore(items, context);
  score += colorScore * 0.4;

  // Check for appropriate accessories
  const accessoryScore = calculateAccessoryScore(items, context);
  score += accessoryScore * 0.2;

  // Check for weather appropriateness
  const weatherScore = calculateWeatherScore(items, context);
  score += weatherScore * 0.2;

  // Normalize score to 0-1 range
  return Math.min(Math.max(score, 0), 1);
}

function calculateColorScore(
  items: WardrobeItem[],
  context: GenerationContext
): number {
  if (items.length === 0) return 0;

  // For formal occasions, prefer complementary colors
  const isFormal = context.events.some(event =>
    event.toLowerCase().includes('meeting') ||
    event.toLowerCase().includes('interview') ||
    event.toLowerCase().includes('dinner')
  );

  if (isFormal) {
    // Check if any two items have complementary colors
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const item1 = items[i];
        const item2 = items[j];

        for (const color1 of item1.colors) {
          for (const color2 of item2.colors) {
            if (COMPLEMENTARY_COLORS[color1]?.includes(color2) ||
                COMPLEMENTARY_COLORS[color2]?.includes(color1)) {
              return 1; // Perfect complementary colors
            }
          }
        }
      }
    }

    // If no complementary colors, check for monochrome
    const firstColor = items[0].colors[0];
    const isMonochrome = items.every(item =>
      item.colors.includes(firstColor)
    );

    return isMonochrome ? 0.7 : 0.3;
  }
  // For casual occasions, prefer analogous colors
  else {
    // Check if all items have analogous colors
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const item1 = items[i];
        const item2 = items[j];

        let hasAnalogous = false;

        for (const color1 of item1.colors) {
          for (const color2 of item2.colors) {
            if (ANALOGOUS_COLORS[color1]?.includes(color2) ||
                ANALOGOUS_COLORS[color2]?.includes(color1)) {
              hasAnalogous = true;
              break;
            }
          }
          if (hasAnalogous) break;
        }

        if (!hasAnalogous) {
          return 0.3; // Not all items have analogous colors
        }
      }
    }

    return 1; // All items have analogous colors
  }
}

function calculateAccessoryScore(
  items: WardrobeItem[],
  context: GenerationContext
): number {
  const hasAccessory = items.some(item => item.category === 'accessory');
  const hasShoes = items.some(item => item.category === 'shoes');

  // For formal occasions, accessories are important
  const isFormal = context.events.some(event =>
    event.toLowerCase().includes('meeting') ||
    event.toLowerCase().includes('interview') ||
    event.toLowerCase().includes('dinner')
  );

  if (isFormal) {
    return hasAccessory ? 1 : 0.3;
  }
  // For casual occasions, accessories are nice but not required
  else {
    return hasAccessory ? 0.7 : 0.5;
  }

  // Shoes are always good
  return hasShoes ? 1 : 0.5;
}

function calculateWeatherScore(
  items: WardrobeItem[],
  context: GenerationContext
): number {
  // Check if all items are appropriate for the weather
  const weatherFiltered = filterByWeather(items, context);
  return weatherFiltered.length === items.length ? 1 : 0.5;
}
