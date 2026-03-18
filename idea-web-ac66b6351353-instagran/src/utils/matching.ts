export const getMatchingScore = (user1: { hobbies: string[] }, user2: { hobbies: string[] }) => {
  const sharedInterests = user1.hobbies.filter(hobby => user2.hobbies.includes(hobby));
  return Math.round((sharedInterests.length / user1.hobbies.length) * 100);
};
