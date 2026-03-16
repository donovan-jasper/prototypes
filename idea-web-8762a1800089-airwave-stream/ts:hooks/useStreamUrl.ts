import { useState, useEffect } from 'react';
import { buildStreamUrl, isOnHomeNetwork } from '../lib/streaming';

export const useStreamUrl = (channelId: string) => {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    const getStreamUrl = async () => {
      const onHomeNetwork = await isOnHomeNetwork();
      const url = buildStreamUrl(channelId, onHomeNetwork);
      setStreamUrl(url);
    };

    getStreamUrl();
  }, [channelId]);

  return streamUrl;
};
