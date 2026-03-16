import JSZip from 'jszip';

export const extractAPK = async (apkFile) => {
  const zip = new JSZip();
  const contents = await zip.loadAsync(apkFile);
  const files = [];

  for (const [path, file] of Object.entries(contents.files)) {
    if (!file.dir) {
      const content = await file.async('text');
      files.push({ path, content });
    }
  }

  return files;
};
