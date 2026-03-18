import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { decompileFile } from '../lib/decompiler';
import { scanForVulnerabilities } from '../lib/security/scanner';
import { saveDecompilation, getRecentDecompilations, getAllDecompilations, getDecompilation } from '../lib/storage/database';
import { saveToCache, getFromCache } from '../lib/storage/cache';
import { diffFiles, matchFiles } from '../lib/comparison/differ';

export const useDecompilation = () => {
  const [recentDecompilations, setRecentDecompilations] = useState([]);
  const [allDecompilations, setAllDecompilations] = useState([]);

  useEffect(() => {
    const loadDecompilations = async () => {
      const recent = await getRecentDecompilations();
      const all = await getAllDecompilations();
      setRecentDecompilations(recent);
      setAllDecompilations(all);
    };
    loadDecompilations();
  }, []);

  const uploadFile = async (file) => {
    const fileHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      file.uri
    );

    const cachedData = await getFromCache(fileHash);
    if (cachedData) {
      return cachedData;
    }

    const fileInfo = await FileSystem.getInfoAsync(file.uri);
    const fileContent = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const decompiledData = await decompileFile(fileContent);
    const securityFindings = scanForVulnerabilities(decompiledData.code);

    const decompilation = {
      fileName: file.name,
      fileSize: fileInfo.size,
      fileHash,
      decompiled: true,
      timestamp: Date.now(),
      files: decompiledData.files,
      code: decompiledData.code,
      securityFindings,
    };

    const id = await saveDecompilation(decompilation);
    await saveToCache(fileHash, { ...decompilation, id });

    const updatedRecent = [decompilation, ...recentDecompilations.slice(0, 9)];
    const updatedAll = [decompilation, ...allDecompilations];

    setRecentDecompilations(updatedRecent);
    setAllDecompilations(updatedAll);

    return { ...decompilation, id };
  };

  const getDecompilationById = async (id) => {
    const decompilation = await getDecompilation(id);
    return decompilation;
  };

  const getComparison = async (decompilation) => {
    const previousVersion = await getPreviousVersion(decompilation);
    if (!previousVersion) return null;

    const matches = matchFiles(decompilation.files, previousVersion.files);
    const comparisons = matches.map((match) => ({
      file1: match.file1,
      file2: match.file2,
      diff: diffFiles(match.file1.content, match.file2.content),
    }));

    return comparisons;
  };

  const getPreviousVersion = async (decompilation) => {
    // Find previous version by matching file name pattern
    const similar = allDecompilations.filter(d => 
      d.fileName.includes(decompilation.fileName.split('.')[0]) &&
      d.timestamp < decompilation.timestamp
    );
    
    if (similar.length > 0) {
      return similar[0];
    }
    
    return null;
  };

  return {
    recentDecompilations,
    allDecompilations,
    uploadFile,
    getDecompilation: getDecompilationById,
    getComparison,
  };
};
