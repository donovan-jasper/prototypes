import { diffLines } from 'diff';

export const diffFiles = (oldCode, newCode) => {
  const diff = diffLines(oldCode, newCode);
  const changes = [];

  for (const part of diff) {
    if (part.added || part.removed) {
      changes.push({
        type: part.added ? 'added' : 'removed',
        value: part.value,
      });
    }
  }

  return changes;
};

export const matchFiles = (files1, files2) => {
  const matches = [];

  for (const file1 of files1) {
    const match = files2.find((file2) => file2.path === file1.path);
    if (match) {
      matches.push({
        file1,
        file2: match,
        similarity: calculateSimilarity(file1.content, match.content),
      });
    }
  }

  return matches;
};

const calculateSimilarity = (content1, content2) => {
  // Implement similarity calculation algorithm
  // Return a value between 0 and 1
};
