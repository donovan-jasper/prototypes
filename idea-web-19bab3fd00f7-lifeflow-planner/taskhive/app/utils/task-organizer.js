export const autoCategorizeTask = (task) => {
  const keywords = {
    Shopping: ['buy', 'purchase', 'grocery'],
    Work: ['meeting', 'project', 'deadline'],
    Personal: ['appointment', 'doctor', 'dentist'],
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => task.title.toLowerCase().includes(word) || task.notes.toLowerCase().includes(word))) {
      return { ...task, category };
    }
  }

  return { ...task, category: 'General' };
};
