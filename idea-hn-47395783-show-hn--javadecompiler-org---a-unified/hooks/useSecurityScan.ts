import { useState, useEffect } from 'react';
import { scanForVulnerabilities, calculateSecurityScore, SecurityScanResult } from '../lib/security/scanner';
import { useDecompilation } from './useDecompilation';

export const useSecurityScan = () => {
  const { currentDecompilation } = useDecompilation();
  const [scanResults, setScanResults] = useState<SecurityScanResult>({
    findings: [],
    score: 100,
    severity: 'low',
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentDecompilation) return;

    const performScan = async () => {
      setIsScanning(true);
      setScanError(null);

      try {
        // In a real app, we would scan all files in the decompilation
        // For this example, we'll just scan the first file
        const firstFile = currentDecompilation.files[0];
        if (!firstFile) {
          throw new Error('No files found in decompilation');
        }

        const findings = scanForVulnerabilities(firstFile.content, firstFile.path);
        const result = calculateSecurityScore(findings);

        setScanResults(result);
      } catch (error) {
        setScanError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsScanning(false);
      }
    };

    performScan();
  }, [currentDecompilation]);

  return {
    scanResults,
    isScanning,
    scanError,
  };
};
