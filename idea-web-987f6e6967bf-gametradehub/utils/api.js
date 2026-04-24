import axios from 'axios';

const RAPIDAPI_KEY = 'YOUR_RAPIDAPI_KEY'; // Replace with your actual key
const RAPIDAPI_HOST = 'igdb-api.p.rapidapi.com';

const api = axios.create({
  baseURL: 'https://igdb-api.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': RAPIDAPI_KEY,
    'X-RapidAPI-Host': RAPIDAPI_HOST,
    'Content-Type': 'text/plain',
  },
});

export const getGameDetails = async (barcode) => {
  try {
    // First, get game ID from barcode
    const barcodeResponse = await api.post('/barcodes', {
      barcode: barcode,
      fields: 'game'
    });

    if (!barcodeResponse.data || !barcodeResponse.data[0]?.game) {
      throw new Error('No game found for this barcode');
    }

    const gameId = barcodeResponse.data[0].game;

    // Then get detailed game info
    const gameResponse = await api.post('/games', {
      fields: 'name,cover,summary,platforms,release_dates',
      where: `id = ${gameId}`
    });

    if (!gameResponse.data || gameResponse.data.length === 0) {
      throw new Error('Game details not found');
    }

    const gameData = gameResponse.data[0];

    // Get market price (mock implementation - replace with real pricing API)
    // Note: IGDB doesn't provide pricing data, so we'll use a mock price
    const mockPrice = Math.floor(Math.random() * 50) + 10; // Random price between $10-$60
    const conditions = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
      id: gameId,
      name: gameData.name,
      cover: gameData.cover?.url ? `https:${gameData.cover.url.replace('t_thumb', 't_cover_big')}` : null,
      summary: gameData.summary,
      platforms: gameData.platforms?.map(p => p.name).join(', ') || 'Unknown',
      releaseDate: gameData.release_dates?.[0]?.human || 'Unknown',
      price: mockPrice,
      condition: randomCondition
    };
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch game details. Please try again.');
  }
};
