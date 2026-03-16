import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';

export const exportDecompilation = async (decompilation) => {
  const zip = new JSZip();
  const folder = zip.folder(decompilation.fileName);

  for (const file of decompilation.files) {
    folder.file(file.path, file.content);
  }

  const zipContent = await zip.generateAsync({ type: 'base64' });
  const fileUri = `${FileSystem.cacheDirectory}${decompilation.fileName}.zip`;

  await FileSystem.writeAsStringAsync(fileUri, zipContent, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/zip',
    dialogTitle: 'Share decompilation',
    UTI: 'com.pkware.zip-archive',
  });
};

export const exportSecurityReport = async (decompilation, findings) => {
  let report = `Security Report for ${decompilation.fileName}\n\n`;
  report += `File Size: ${decompilation.fileSize} bytes\n`;
  report += `Decompiled: ${decompilation.decompiled ? 'Yes' : 'No'}\n`;
  report += `Date: ${new Date(decompilation.timestamp).toLocaleString()}\n\n`;

  report += 'Security Findings:\n';
  for (const finding of findings) {
    report += `- ${finding.type} (${finding.severity}): ${finding.description}\n`;
  }

  const fileUri = `${FileSystem.cacheDirectory}${decompilation.fileName}_report.txt`;
  await FileSystem.writeAsStringAsync(fileUri, report);

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/plain',
    dialogTitle: 'Share security report',
    UTI: 'public.plain-text',
  });
};
