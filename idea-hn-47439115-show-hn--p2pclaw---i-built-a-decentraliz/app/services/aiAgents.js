// Mock implementation of AI suggestion service
// In a real app, this would call an actual AI API

export const getAISuggestions = async (content) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate mock suggestions based on content
  const suggestions = [];

  // Check if content is empty
  if (!content.trim()) {
    suggestions.push("Please provide some content to get suggestions.");
    return suggestions;
  }

  // Generate content-specific suggestions
  if (content.toLowerCase().includes('methodology')) {
    suggestions.push("Consider adding a control group to your methodology section.");
    suggestions.push("You might want to include statistical significance calculations.");
  }

  if (content.toLowerCase().includes('results')) {
    suggestions.push("Consider visualizing your results with a graph or chart.");
    suggestions.push("Discuss potential limitations of your findings.");
  }

  if (content.toLowerCase().includes('conclusion')) {
    suggestions.push("Summarize the key findings in your conclusion.");
    suggestions.push("Propose future research directions.");
  }

  // Add some generic suggestions
  suggestions.push("Check for proper citation formatting in your references.");
  suggestions.push("Ensure your abstract is concise and informative.");

  // Randomly select 3-5 suggestions to return
  const shuffled = suggestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(3, suggestions.length));
};
