import { useState, useEffect } from 'react';
import { buildStreamUrl, isOnHomeNetwork } from '../lib/streaming';

export const useStreamUrl = (channelNumber: string) => {
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [isLocal, setIsLocal] = useState<boolean>(true);

  useEffect(() => {
    const getStreamUrl = async () => {
      if (!channelNumber) {
        setStreamUrl('');
        return;
      }

      const onHomeNetwork = await isOnHomeNetwork();
      setIsLocal(onHomeNetwork);
      const url = await buildStreamUrl(channelNumber, onHomeNetwork);
      setStreamUrl(url);
    };

    getStreamUrl();
  }, [channelNumber]);

  return { streamUrl, isLocal };
};
