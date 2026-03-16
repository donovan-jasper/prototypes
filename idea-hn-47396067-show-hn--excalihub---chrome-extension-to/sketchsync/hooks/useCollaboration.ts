import { useEffect } from 'react';
import { joinCollaboration } from '@/lib/collaboration';

export const useCollaboration = (shareId: string, callback: (drawing: Drawing) => void) => {
  useEffect(() => {
    const cleanup = joinCollaboration(shareId, callback);
    return cleanup;
  }, [shareId, callback]);
};
