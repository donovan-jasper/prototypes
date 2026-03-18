interface GenerateSlidesResult {
  html: string;
  slideCount: number;
}

export async function generateSlides(prompt: string): Promise<GenerateSlidesResult> {
  if (!prompt.trim()) {
    throw new Error('Prompt cannot be empty');
  }

  // Mock implementation - returns sample HTML slides
  // In production, this would call Claude API
  await new Promise(resolve => setTimeout(resolve, 2000));

  const slides = [
    {
      title: 'Introduction',
      content: `<h1>${prompt.slice(0, 50)}</h1><p>Generated from your prompt</p>`,
    },
    {
      title: 'Key Points',
      content: '<h2>Main Ideas</h2><ul><li>Point 1</li><li>Point 2</li><li>Point 3</li></ul>',
    },
    {
      title: 'Conclusion',
      content: '<h2>Summary</h2><p>Thank you for your attention</p>',
    },
  ];

  const slideHtmlArray = slides.map(slide => `
    <div class="slide">
      <div class="slide-content">
        ${slide.content}
      </div>
    </div>
  `);

  const fullHtml = createSlideHTML(slideHtmlArray);

  return {
    html: fullHtml,
    slideCount: slides.length,
  };
}

function createSlideHTML(slides: string[]): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #000;
      overflow: hidden;
    }
    
    .slide {
      display: none;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    
    .slide:first-child {
      display: flex;
    }
    
    .slide-content {
      max-width: 900px;
      width: 100%;
      color: #fff;
      text-align: center;
    }
    
    .slide-content h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    
    .slide-content h2 {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      line-height: 1.3;
    }
    
    .slide-content p {
      font-size: 1.5rem;
      line-height: 1.6;
      margin-bottom: 1rem;
      opacity: 0.95;
    }
    
    .slide-content ul {
      list-style: none;
      text-align: left;
      display: inline-block;
      font-size: 1.5rem;
    }
    
    .slide-content li {
      margin-bottom: 1rem;
      padding-left: 2rem;
      position: relative;
    }
    
    .slide-content li:before {
      content: '•';
      position: absolute;
      left: 0;
      font-size: 2rem;
      line-height: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .slide-content h1 {
        font-size: 2rem;
      }
      
      .slide-content h2 {
        font-size: 1.75rem;
      }
      
      .slide-content p,
      .slide-content ul {
        font-size: 1.25rem;
      }
    }
  </style>
</head>
<body>
  ${slides.join('\n')}
</body>
</html>
  `.trim();
}
