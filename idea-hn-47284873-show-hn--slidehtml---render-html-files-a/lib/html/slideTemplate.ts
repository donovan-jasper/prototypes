export interface SlideTheme {
  name: string;
  background: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
}

export const themes: Record<string, SlideTheme> = {
  minimal: {
    name: 'Minimal',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    accentColor: '#ffd700',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
  corporate: {
    name: 'Corporate',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    textColor: '#ffffff',
    accentColor: '#00d4ff',
    fontFamily: 'Georgia, "Times New Roman", serif',
  },
  modern: {
    name: 'Modern',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: '#ffffff',
    accentColor: '#ffeb3b',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  dark: {
    name: 'Dark',
    background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    textColor: '#ffffff',
    accentColor: '#00ff88',
    fontFamily: '"Courier New", Courier, monospace',
  },
  light: {
    name: 'Light',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    textColor: '#333333',
    accentColor: '#ff6b6b',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
};

export function createSlideHTML(slideContents: string[], themeName: string = 'minimal'): string {
  const theme = themes[themeName] || themes.minimal;
  
  const slides = slideContents.map(content => `
    <div class="slide">
      <div class="slide-content">
        ${content}
      </div>
    </div>
  `).join('\n');

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
      font-family: ${theme.fontFamily};
      background: #000;
      overflow: hidden;
    }
    
    .slide {
      display: none;
      width: 100vw;
      height: 100vh;
      background: ${theme.background};
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
      color: ${theme.textColor};
      text-align: center;
    }
    
    .slide-content h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.2;
      color: ${theme.textColor};
    }
    
    .slide-content h2 {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      line-height: 1.3;
      color: ${theme.textColor};
    }
    
    .slide-content h3 {
      font-size: 2rem;
      font-weight: 500;
      margin-bottom: 1rem;
      color: ${theme.accentColor};
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
      color: ${theme.accentColor};
    }
    
    .slide-content strong {
      color: ${theme.accentColor};
      font-weight: 700;
    }
    
    .slide-content em {
      font-style: italic;
      opacity: 0.9;
    }
    
    @media (max-width: 768px) {
      .slide {
        padding: 20px;
      }
      
      .slide-content h1 {
        font-size: 2rem;
      }
      
      .slide-content h2 {
        font-size: 1.75rem;
      }
      
      .slide-content h3 {
        font-size: 1.5rem;
      }
      
      .slide-content p,
      .slide-content ul {
        font-size: 1.25rem;
      }
    }
  </style>
</head>
<body>
  ${slides}
</body>
</html>
  `.trim();
}
