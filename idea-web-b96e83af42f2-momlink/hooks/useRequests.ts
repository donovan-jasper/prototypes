import { useState, useEffect } from 'react';
import { getRequests } from '../lib/db';
import { Request } from '../types';
import { calculateDistance } from '../lib/location';

interface UseRequestsParams {
  latitude: number;
  longitude: number;
  radius: number;
}

export function useRequests({ latitude, longitude, radius }: UseRequestsParams) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [latitude, longitude, radius]);

  async function loadRequests() {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequests(latitude, longitude, radius);
      const filtered = data.filter(req => {
        const distance = calculateDistance(latitude, longitude, req.latitude, req.longitude);
        return distance <= radius;
      });
      setRequests(filtered);
    } catch (error) {
      console.error('Error loading requests:', error);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return { requests, loading, error, refresh: loadRequests };
}
