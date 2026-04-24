export const themes = {
  minimal: {
    name: 'Minimal',
    colors: {
      primary: '#333333',
      secondary: '#666666',
      text: '#333333',
      background: '#ffffff',
      heading: '#333333',
    },
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    styles: `
      .slide {
        border: none;
        box-shadow: none;
      }
    `,
  },
  corporate: {
    name: 'Corporate',
    colors: {
      primary: '#0056b3',
      secondary: '#003366',
      text: '#333333',
      background: '#ffffff',
      heading: '#0056b3',
    },
    fontFamily: "'Arial', sans-serif",
    styles: `
      .slide {
        border: 1px solid #e0e0e0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .slide h1 {
        border-bottom: 2px solid var(--primary-color);
        padding-bottom: 10px;
      }

      .slide .footer {
        position: absolute;
        bottom: 20px;
        right: 20px;
        font-size: 0.8rem;
        color: var(--secondary-color);
      }
    `,
  },
  modern: {
    name: 'Modern',
    colors: {
      primary: '#4a6fa5',
      secondary: '#166088',
      text: '#333333',
      background: '#f8f9fa',
      heading: '#166088',
    },
    fontFamily: "'Roboto', sans-serif",
    styles: `
      .slide {
        border-radius: 8px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .slide h1 {
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
      }

      .slide ul li:before {
        content: "✓";
        color: var(--primary-color);
      }
    `,
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#bb86fc',
      secondary: '#3700b3',
      text: '#e0e0e0',
      background: '#121212',
      heading: '#bb86fc',
    },
    fontFamily: "'Segoe UI', sans-serif",
    styles: `
      .slide {
        background-color: #1e1e1e;
        border: 1px solid #333;
      }

      .slide h1, .slide h2, .slide h3 {
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      }

      .slide ul li:before {
        color: #bb86fc;
      }
    `,
  },
  creative: {
    name: 'Creative',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      text: '#2d3436',
      background: '#f5f6fa',
      heading: '#ff6b6b',
    },
    fontFamily: "'Pacifico', cursive",
    styles: `
      .slide {
        border: 3px dashed #ff6b6b;
        background: linear-gradient(135deg, #f5f6fa 0%, #dfe6e9 100%);
      }

      .slide h1 {
        font-family: 'Pacifico', cursive;
        font-size: 3rem;
        color: #ff6b6b;
      }

      .slide h2 {
        font-family: 'Pacifico', cursive;
        color: #4ecdc4;
      }

      .slide ul li:before {
        content: "★";
        color: #ff6b6b;
      }
    `,
  },
};

export type ThemeName = keyof typeof themes;
