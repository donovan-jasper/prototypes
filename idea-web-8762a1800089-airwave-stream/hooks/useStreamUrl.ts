import { useState, useEffect } from 'react';
import { buildStreamUrl, isOnHomeNetwork, establishRemoteConnection } from '../lib/streaming';

export const useStreamUrl = (channelNumber: string) => {
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [isLocal, setIsLocal] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const getStreamUrl = async () => {
      if (!channelNumber) {
        setStreamUrl('');
        return;
      }

      const onHomeNetwork = await isOnHomeNetwork();
      setIsLocal(onHomeNetwork);

      if (!onHomeNetwork) {
        setIsConnecting(true);
        const connectionSuccess = await establishRemoteConnection();
        setIsConnecting(false);

        if (!connectionSuccess) {
          setConnectionError('Failed to establish remote connection');
          return;
        }
      }

      const url = await buildStreamUrl(channelNumber, onHomeNetwork);
      setStreamUrl(url);
    };

    getStreamUrl();
  }, [channelNumber]);

  return { streamUrl, isLocal, isConnecting, connectionError };
};
