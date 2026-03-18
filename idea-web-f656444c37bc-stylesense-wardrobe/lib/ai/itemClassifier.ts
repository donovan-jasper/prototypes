import { Category } from '@/types';
import * as ImageManipulator from 'expo-image-manipulator';

export async function classifyItem(imageUri: string): Promise<{
  category: Category;
  colors: string[];
  tags: string[];
}> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 300 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    const colors = await extractColors(manipResult.uri);
    const category = guessCategory(manipResult.width, manipResult.height);
    const tags = suggestTags(category, colors);

    return { category, colors, tags };
  } catch (error) {
    console.error('Classification error:', error);
    return {
      category: 'top',
      colors: ['#000000'],
      tags: ['casual']
    };
  }
}

function guessCategory(width: number, height: number): Category {
  const aspectRatio = height / width;
  
  if (aspectRatio > 1.5) return 'dress';
  if (aspectRatio > 1.2) return 'top';
  if (aspectRatio < 0.8) return 'shoes';
  return 'bottom';
}

async function extractColors(imageUri: string): Promise<string[]> {
  const sampleColors = [
    '#2C3E50', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
    '#9B59B6', '#1ABC9C', '#34495E', '#E67E22', '#95A5A6'
  ];
  
  const randomColors = [];
  for (let i = 0; i < 3; i++) {
    randomColors.push(sampleColors[Math.floor(Math.random() * sampleColors.length)]);
  }
  
  return randomColors;
}

function suggestTags(category: Category, colors: string[]): string[] {
  const tags = ['casual'];
  
  const darkColors = colors.filter(c => {
    const hex = c.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r + g + b) / 3;
    return brightness < 100;
  });

  if (darkColors.length >= 2) {
    tags.push('formal');
  }

  if (category === 'shoes' || category === 'bottom') {
    tags.push('everyday');
  }

  return tags;
}
