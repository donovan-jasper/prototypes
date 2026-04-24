import { themes } from './themes';

interface SlideTemplateOptions {
  theme?: string;
  aspectRatio?: string;
  fontFamily?: string;
}

export function createSlideHTML(
  slideContents: string[],
  themeName: string = 'minimal',
  options: SlideTemplateOptions = {}
): string {
  const theme = themes[themeName] || themes.minimal;
  const aspectRatio = options.aspectRatio || '16/9';
  const fontFamily = options.fontFamily || theme.fontFamily;

  const slideHTML = slideContents.map((content, index) => `
    <div class="slide" data-slide-index="${index}">
      ${content}
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SlideFlow Presentation</title>
  <style>
    :root {
      --primary-color: ${theme.colors.primary};
      --secondary-color: ${theme.colors.secondary};
      --text-color: ${theme.colors.text};
      --background-color: ${theme.colors.background};
      --heading-color: ${theme.colors.heading};
      --font-family: ${fontFamily};
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-family);
      color: var(--text-color);
      background-color: var(--background-color);
      margin: 0;
      padding: 0;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
    }

    .slide-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .slide {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px;
      background-color: var(--background-color);
      overflow: hidden;
      aspect-ratio: ${aspectRatio};
      margin: auto;
      box-sizing: border-box;
    }

    .slide h1 {
      font-size: 2.5rem;
      color: var(--heading-color);
      margin-bottom: 20px;
      text-align: center;
      font-weight: 700;
    }

    .slide h2 {
      font-size: 2rem;
      color: var(--heading-color);
      margin-bottom: 15px;
      text-align: center;
      font-weight: 600;
    }

    .slide h3 {
      font-size: 1.5rem;
      color: var(--heading-color);
      margin-bottom: 10px;
      font-weight: 500;
    }

    .slide p {
      font-size: 1.2rem;
      line-height: 1.5;
      margin-bottom: 15px;
      max-width: 800px;
      text-align: center;
    }

    .slide ul {
      font-size: 1.2rem;
      line-height: 1.5;
      max-width: 800px;
      list-style-type: none;
      padding-left: 0;
    }

    .slide li {
      margin-bottom: 10px;
      position: relative;
      padding-left: 25px;
    }

    .slide li:before {
      content: "•";
      color: var(--primary-color);
      position: absolute;
      left: 0;
      font-size: 1.5rem;
    }

    .slide strong {
      color: var(--primary-color);
      font-weight: 600;
    }

    .slide img {
      max-width: 100%;
      max-height: 60vh;
      object-fit: contain;
      margin: 20px 0;
    }

    .slide .content-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .slide .title-section {
      margin-bottom: 30px;
    }

    .slide .body-section {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .slide .footer {
      font-size: 0.8rem;
      color: var(--secondary-color);
      margin-top: 20px;
      text-align: center;
    }

    /* Theme-specific styles */
    ${theme.styles || ''}
  </style>
</head>
<body>
  <div class="slide-container">
    ${slideHTML}
  </div>

  <script>
    // Initialize slides
    const slides = document.querySelectorAll('.slide');
    let currentIndex = 0;

    // Show first slide
    if (slides.length > 0) {
      slides[0].style.display = 'flex';
    }

    // Handle touch events for swipe navigation
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, false);

    function handleSwipe() {
      if (touchEndX < touchStartX - 50) {
        // Swipe left - next slide
        if (currentIndex < slides.length - 1) {
          slides[currentIndex].style.display = 'none';
          currentIndex++;
          slides[currentIndex].style.display = 'flex';
        }
      }

      if (touchEndX > touchStartX + 50) {
        // Swipe right - previous slide
        if (currentIndex > 0) {
          slides[currentIndex].style.display = 'none';
          currentIndex--;
          slides[currentIndex].style.display = 'flex';
        }
      }
    }

    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (currentIndex < slides.length - 1) {
          slides[currentIndex].style.display = 'none';
          currentIndex++;
          slides[currentIndex].style.display = 'flex';
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          slides[currentIndex].style.display = 'none';
          currentIndex--;
          slides[currentIndex].style.display = 'flex';
        }
      }
    });
  </script>
</body>
</html>
  `;
}
