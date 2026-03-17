import { Lesson } from '../types/lesson';

export const lessons: Lesson[] = [
  {
    id: 'intro-to-stocks',
    title: 'What is a Stock?',
    description: 'Learn the basics of stocks and how they represent ownership in companies.',
    content: 'A stock is a type of security that represents ownership in a corporation...',
    quiz: [
      {
        question: 'What does a stock represent?',
        options: [
          'A loan to the company',
          'Ownership in the company',
          'A government bond',
          'A savings account'
        ],
        correctAnswer: 1
      }
    ],
    isPremium: false,
    progress: 0
  },
  {
    id: 'reading-stock-prices',
    title: 'Reading Stock Prices',
    description: 'Understand how to interpret stock price charts and metrics.',
    content: 'Stock prices are influenced by supply and demand...',
    quiz: [
      {
        question: 'What does a green candle on a stock chart typically indicate?',
        options: [
          'The stock price decreased',
          'The stock price increased',
          'The stock is about to split',
          'The stock is delisted'
        ],
        correctAnswer: 1
      }
    ],
    isPremium: false,
    progress: 0
  },
  {
    id: 'dividends-explained',
    title: 'Dividends Explained',
    description: 'Learn about how companies pay dividends and why they matter.',
    content: 'Dividends are payments made by companies to their shareholders...',
    quiz: [
      {
        question: 'What is a dividend yield?',
        options: [
          'The number of shares outstanding',
          'The percentage of a stock price paid as dividend',
          'The total value of all dividends paid',
          'The price at which a stock is issued'
        ],
        correctAnswer: 1
      }
    ],
    isPremium: false,
    progress: 0
  },
  {
    id: 'risk-vs-reward',
    title: 'Risk vs. Reward',
    description: 'Understand the relationship between investment risk and potential returns.',
    content: 'Investing always involves some level of risk...',
    quiz: [
      {
        question: 'Which of these typically offers higher potential returns but also higher risk?',
        options: [
          'Government bonds',
          'Savings accounts',
          'Individual stocks',
          'Certificates of deposit'
        ],
        correctAnswer: 2
      }
    ],
    isPremium: false,
    progress: 0
  },
  {
    id: 'etfs-vs-stocks',
    title: 'ETFs vs. Individual Stocks',
    description: 'Compare exchange-traded funds with individual stocks.',
    content: 'ETFs (Exchange-Traded Funds) are investment funds...',
    quiz: [
      {
        question: 'Which of these is typically more diversified?',
        options: [
          'An individual stock',
          'An ETF',
          'A mutual fund',
          'A bond'
        ],
        correctAnswer: 1
      }
    ],
    isPremium: true,
    progress: 0
  },
  {
    id: 'market-cycles',
    title: 'Understanding Market Cycles',
    description: 'Learn about the different phases of the stock market.',
    content: 'The stock market goes through cycles of growth and decline...',
    quiz: [
      {
        question: 'What is a bear market?',
        options: [
          'A market with high volatility',
          'A market with declining prices',
          'A market with high interest rates',
          'A market with low liquidity'
        ],
        correctAnswer: 1
      }
    ],
    isPremium: true,
    progress: 0
  },
  {
    id: 'tax-impact',
    title: 'Tax Impact of Investing',
    description: 'Understand how investing affects your tax situation.',
    content: 'Investing can have tax implications depending on your country...',
    quiz: [
      {
        question: 'What is capital gains tax?',
        options: [
          'Tax on income from employment',
          'Tax on profits from selling investments',
          'Tax on dividends received',
          'Tax on interest earned'
        ],
        correctAnswer: 1
      }
    ],
    isPremium: true,
    progress: 0
  },
  {
    id: 'portfolio-diversification',
    title: 'Portfolio Diversification',
    description: 'Learn how to build a diversified investment portfolio.',
    content: 'Diversification is the practice of investing in a variety...',
    quiz: [
      {
        question: 'Why is diversification important?',
        options: [
          'It guarantees profits',
          'It reduces risk by spreading investments',
          'It increases tax benefits',
          'It simplifies portfolio management'
        ],
        correctAnswer: 1
      }
    ],
    isPremium: true,
    progress: 0
  },
  {
    id: 'investment-horizons',
    title: 'Investment Horizons',
    description: 'Understand different investment time horizons.',
    content: 'Investment horizons refer to the length of time...',
    quiz: [
      {
        question: 'Which investment horizon typically has the highest risk?',
        options: [
          'Short-term (1-3 years)',
          'Medium-term (3-10 years)',
          'Long-term (10+ years)',
          'All have equal risk'
        ],
        correctAnswer: 0
      }
    ],
    isPremium: true,
    progress: 0
  },
  {
    id: 'emerging-markets',
    title: 'Emerging Markets',
    description: 'Learn about investing in developing economies.',
    content: 'Emerging markets refer to economies that are...',
    quiz: [
      {
        question: 'What is a characteristic of emerging market stocks?',
        options: [
          'High liquidity',
          'High volatility',
          'Low growth potential',
          'Stable prices'
        ],
        correctAnswer: 1
      }
    ],
    isPremium: true,
    progress: 0
  }
];
