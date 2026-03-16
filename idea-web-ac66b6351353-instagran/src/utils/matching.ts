export const getMatchingScore = (user1, user2) => {
  const sharedInterests = user1.hobbies.filter(hobby => user2.hobbies.includes(hobby));
  const totalInterests = new Set([...user1.hobbies, ...user2.hobbies]).size;
  return Math.round((sharedInterests.length / totalInterests) * 100);
};
