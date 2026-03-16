# DemoGenie

DemoGenie is a CLI tool that automatically generates demo videos with AI voiceover for web applications, eliminating manual screen recording and scripting.

## Tech Stack

* Backend: Node/Express
* Frontend: Vanilla HTML/CSS/JS
* Database: SQLite
* Browser Automation: Playwright
* Natural Language Generation: Node-NLTK
* Voice Synthesis: Google Text-to-Speech API

## Setup

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `config.json` file with Playwright and Google Text-to-Speech API credentials.
4. Run `npm start` to start the application.

## Usage

1. Run the CLI interface using `node app.js generate <url>` to generate a demo video for the given URL.
2. Follow the prompts to customize the demo video.
3. The generated demo video will be saved in the `output` directory.

## Testing

1. Run `npm test` to run tests.
2. Verify that the generated demo video has AI voiceover and accurate UI element detection.
3. Test the application with different web applications, UI elements, and voice synthesis options to ensure robustness.
