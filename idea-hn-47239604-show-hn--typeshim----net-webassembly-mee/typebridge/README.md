# TypeBridge

Compile, debug, and run .NET WebAssembly apps directly on your phone—no desktop required.

## Setup

1. Install Node.js and npm
2. Install Expo CLI: `npm install -g expo-cli`
3. Clone the repository
4. Install dependencies: `npm install`

## Run the app

1. Start the development server: `npm start`
2. Scan the QR code with the Expo Go app on your iOS or Android device
3. Alternatively, run on a specific platform:
   - Android: `npm run android`
   - iOS: `npm run ios`
   - Web: `npm run web`

## Test the app

Run the test suite with: `npm test`

## Build for production

1. Build the app: `expo build:android` or `expo build:ios`
2. Follow the prompts to upload the build to the respective app store
