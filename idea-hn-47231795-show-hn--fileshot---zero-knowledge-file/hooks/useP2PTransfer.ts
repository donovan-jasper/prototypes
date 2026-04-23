import { useP2PTransfer as useP2PTransferImpl } from '@/lib/p2p';

export const useP2PTransfer = () => {
  const {
    isTransferring,
    progress,
    connectionState,
    peers,
    discoverPeers,
    sendFileP2P,
    receiveFileP2P,
    cancelTransfer
  } = useP2PTransferImpl();

  return {
    isTransferring,
    progress,
    connectionState,
    peers,
    discoverPeers,
    sendFileP2P,
    receiveFileP2P,
    cancelTransfer
  };
};
