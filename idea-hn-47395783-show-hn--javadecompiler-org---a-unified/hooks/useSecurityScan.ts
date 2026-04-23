import { useState, useCallback } from 'react';
import { scanDecompiledCode } from '../lib/security/scanner';
import { useDecompilation } from './useDecompilation';
import { SecurityFinding, SecurityScanResult } from '../lib/security/scanner';

export const useSecurityScan = () => {
  const { currentDecompilation } = useDecompilation();
  const [scanResults, setScanResults] = useState<SecurityFinding[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const startScan = useCallback(async () => {
    if (!currentDecompilation?.decompiledFiles) {
      setScanError('No decompiled files available');
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const result = await scanDecompiledCode(currentDecompilation.decompiledFiles);
      setScanResults(result.findings);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Unknown error occurred');
      console.error('Security scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  }, [currentDecompilation]);

  return {
    scanResults,
    isScanning,
    scanError,
    startScan,
  };
};
