export const SYSTEM_PROMPT = `You are an expert presentation designer. Generate slide content as an array of HTML strings based on the user's prompt.

Rules:
1. Return ONLY a valid JSON array of HTML strings, nothing else
2. Each array element is the content for ONE slide
3. Use semantic HTML: <h1> for titles, <h2> for subtitles, <h3> for section headers, <p> for body text, <ul>/<li> for lists
4. Keep content concise - slides should be scannable, not text-heavy
5. Use <strong> for emphasis and key terms
6. Aim for 3-7 slides depending on topic complexity
7. First slide should be a title slide with main topic
8. Last slide should be a conclusion or call-to-action
9. Middle slides should cover key points with clear hierarchy
10. Include appropriate visual elements like icons or images when relevant
11. Use consistent styling across slides

Example output format:
[
  "<h1>Main Title</h1><p>Subtitle or tagline</p>",
  "<h2>Key Point 1</h2><ul><li>Supporting detail</li><li>Another detail</li></ul>",
  "<h2>Conclusion</h2><p>Final thoughts</p>"
]

Do NOT include any markdown, explanations, or text outside the JSON array.`;

export const TEMPLATE_TYPES = {
  PITCH_DECK: 'pitch-deck',
  LESSON_PLAN: 'lesson-plan',
  REPORT: 'report',
  STORYTELLING: 'storytelling',
  MINIMAL: 'minimal',
  CORPORATE: 'corporate'
};

export const getTemplatePrompt = (templateType: string): string => {
  switch (templateType) {
    case TEMPLATE_TYPES.PITCH_DECK:
      return `Generate a pitch deck with:
1. Title slide with company/product name and tagline
2. Problem slide with customer pain points
3. Solution slide with your unique value proposition
4. Market slide with size and growth potential
5. Business model slide with revenue streams
6. Traction slide with milestones and metrics
7. Ask slide with funding request and use of funds`;

    case TEMPLATE_TYPES.LESSON_PLAN:
      return `Generate a lesson plan with:
1. Title slide with lesson title and date
2. Learning objectives slide
3. Warm-up activity slide
4. Main content slide with key concepts
5. Interactive activity slide
6. Assessment slide with questions or tasks
7. Homework slide with follow-up tasks`;

    case TEMPLATE_TYPES.REPORT:
      return `Generate a report with:
1. Title slide with report title and date
2. Executive summary slide
3. Key findings slide with visual elements
4. Data analysis slide with charts
5. Recommendations slide
6. Next steps slide
7. Contact information slide`;

    case TEMPLATE_TYPES.STORYTELLING:
      return `Generate a storytelling presentation with:
1. Title slide with story title
2. Character introduction slide
3. Setting slide with background information
4. Conflict slide with challenges
5. Resolution slide with outcomes
6. Moral or lesson slide
7. Call to action slide`;

    case TEMPLATE_TYPES.MINIMAL:
      return `Generate a minimal presentation with:
1. Title slide with only title and subtitle
2. Bullet point slides with clear hierarchy
3. Minimal visual elements
4. Simple color scheme
5. Clean typography`;

    case TEMPLATE_TYPES.CORPORATE:
      return `Generate a corporate presentation with:
1. Title slide with company logo and tagline
2. Agenda slide with section headings
3. Data-driven slides with charts and graphs
4. Professional visual elements
5. Corporate color scheme
6. Consistent branding elements`;

    default:
      return `Generate a standard presentation with:
1. Title slide with main topic
2. Key points slides with clear hierarchy
3. Visual elements when appropriate
4. Consistent styling
5. Conclusion slide`;
  }
};
