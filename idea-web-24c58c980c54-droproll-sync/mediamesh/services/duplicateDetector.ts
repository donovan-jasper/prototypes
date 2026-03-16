import { compareHashes } from '../utils/imageHash';

export const findDuplicates = (mediaArray) => {
  const duplicates = [];

  for (let i = 0; i < mediaArray.length; i++) {
    for (let j = i + 1; j < mediaArray.length; j++) {
      const similarity = compareHashes(mediaArray[i].hash, mediaArray[j].hash);
      if (similarity > 0.9) {
        const existingGroup = duplicates.find((group) =>
          group.matches.some((match) => match.id === mediaArray[i].id)
        );

        if (existingGroup) {
          existingGroup.matches.push(mediaArray[j]);
        } else {
          duplicates.push({
            id: mediaArray[i].id,
            matches: [mediaArray[i], mediaArray[j]],
          });
        }
      }
    }
  }

  return duplicates;
};
