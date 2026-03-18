import { useState, useEffect } from 'react';
import { buildStreamUrl, isOnHomeNetwork } from '../lib/streaming';

export const useStreamUrl = (channelNumber: string) => {
  const [streamUrl, setStreamUrl] = useState<string>('');

  useEffect(() => {
    const getStreamUrl = async () => {
      if (!channelNumber) {
        setStreamUrl('');
        return;
      }
      
      const onHomeNetwork = await isOnHomeNetwork();
      const url = await buildStreamUrl(channelNumber, onHomeNetwork);
      setStreamUrl(url);
    };

    getStreamUrl();
  }, [channelNumber]);

  return streamUrl;
};
