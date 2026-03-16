import { useState, useEffect } from 'react';
import { getSecurityFindings } from '../lib/storage/database';

export const useSecurityScan = (decompilationId) => {
  const [securityFindings, setSecurityFindings] = useState([]);

  useEffect(() => {
    const loadSecurityFindings = async () => {
      const findings = await getSecurityFindings(decompilationId);
      setSecurityFindings(findings);
    };
    loadSecurityFindings();
  }, [decompilationId]);

  return {
    securityFindings,
  };
};
