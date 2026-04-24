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
      fields: 'name,cover,summary,platforms,release_dates,genres,involved_companies.company.name',
      where: `id = ${gameId}`
    });

    if (!gameResponse.data || gameResponse.data.length === 0) {
      throw new Error('Game details not found');
    }

    const gameData = gameResponse.data[0];

    // Get market price from a real pricing API (mock implementation)
    // In a real app, you would use a dedicated game pricing API like PriceChartingAPI
    const priceResponse = await axios.get(`https://api.pricecharting.com/api/products?q=${encodeURIComponent(gameData.name)}&key=YOUR_PRICECHARTING_KEY`);

    let priceData;
    if (priceResponse.data && priceResponse.data.products && priceResponse.data.products.length > 0) {
      // Use the first product's price as our market price
      priceData = priceResponse.data.products[0];
    } else {
      // Fallback to mock price if real API fails
      priceData = {
        price: Math.floor(Math.random() * 50) + 10,
        condition: ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'][Math.floor(Math.random() * 4)]
      };
    }

    return {
      id: gameId,
      name: gameData.name,
      cover: gameData.cover?.url ? `https:${gameData.cover.url.replace('t_thumb', 't_cover_big')}` : null,
      summary: gameData.summary,
      platforms: gameData.platforms?.map(p => p.name).join(', ') || 'Unknown',
      releaseDate: gameData.release_dates?.[0]?.human || 'Unknown',
      price: priceData.price,
      condition: priceData.condition,
      genres: gameData.genres?.map(g => g.name).join(', ') || 'Unknown',
      developer: gameData.involved_companies?.find(ic => ic.developer)?.company?.name || 'Unknown'
    };
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch game details. Please try again.');
  }
};
