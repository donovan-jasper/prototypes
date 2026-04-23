import { useState, useEffect } from 'react';
import { buildStreamUrl, isOnHomeNetwork, establishRemoteConnection, getRemoteStreamUrl } from '../lib/streaming';

export const useStreamUrl = (channelNumber: string) => {
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [isLocal, setIsLocal] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);

  useEffect(() => {
    const getStreamUrl = async () => {
      if (!channelNumber) {
        setStreamUrl('');
        return;
      }

      const onHomeNetwork = await isOnHomeNetwork();
      setIsLocal(onHomeNetwork);

      if (!onHomeNetwork) {
        const isPremium = await isRemoteStreamingEnabled();
        if (!isPremium) {
          setShowPaywall(true);
          return;
        }

        setIsConnecting(true);
        const connectionSuccess = await establishRemoteConnection();
        setIsConnecting(false);

        if (!connectionSuccess) {
          setConnectionError('Failed to establish remote connection');
          return;
        }

        const remoteUrl = await getRemoteStreamUrl(channelNumber);
        setStreamUrl(remoteUrl);
      } else {
        const localUrl = await buildStreamUrl(channelNumber, true);
        setStreamUrl(localUrl);
      }
    };

    getStreamUrl();
  }, [channelNumber]);

  return { streamUrl, isLocal, isConnecting, connectionError, showPaywall };
};
