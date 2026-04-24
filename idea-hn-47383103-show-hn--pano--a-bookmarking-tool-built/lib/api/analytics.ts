import { API_BASE_URL } from '../utils/constants';

export async function trackShelfView(shelfId: number): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/shelf-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shelfId }),
    });

    if (!response.ok) {
      throw new Error('Failed to track view');
    }

    const data = await response.json();
    return data.viewCount;
  } catch (error) {
    console.error('Error tracking shelf view:', error);
    throw error;
  }
}
