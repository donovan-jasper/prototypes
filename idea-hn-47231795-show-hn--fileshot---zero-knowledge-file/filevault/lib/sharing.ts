import { generateKey } from './crypto';
import { addShare, getShare } from './database';

export const generateShareLink = async (fileId, expirationHours) => {
  const linkId = await generateKey().then(key => key.toString('hex').substring(0, 16));
  const expiresAt = Date.now() + expirationHours * 60 * 60 * 1000;

  await addShare({
    id: Date.now().toString(),
    fileId,
    linkId,
    expiresAt,
    downloadCount: 0,
    maxDownloads: 1,
  });

  return `filevault://receive/${linkId}?exp=${expiresAt}`;
};

export const validateShareLink = (link) => {
  const regex = /^filevault:\/\/receive\/([a-f0-9]{16})\?exp=(\d+)$/;
  const match = link.match(regex);

  if (!match) {
    throw new Error('Invalid share link');
  }

  const [, linkId, expiresAt] = match;
  return { linkId, expiresAt: parseInt(expiresAt, 10) };
};

export const isLinkExpired = (expiresAt) => {
  return Date.now() > expiresAt;
};

export const incrementDownloadCount = async (linkId) => {
  const share = await getShare(linkId);
  if (!share) {
    throw new Error('Share not found');
  }

  share.downloadCount += 1;
  // Update share in database
  // This is a simplified example
  return share;
};
