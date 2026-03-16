# Support Sentinel

Never miss a response again — get instant alerts when your support tickets are stuck, with smart follow-ups that get you answers faster.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI installed globally (`npm install -g @expo/cli`)

### Installation Steps
1. Clone this repository
2. Navigate to the project directory: `cd support-sentinel`
3. Install dependencies: `npm install`
4. Start the development server: `npx expo start`

### Running on Devices/Simulators
- Press 'i' for iOS simulator
- Press 'a' for Android emulator
- Scan QR code with Expo Go app on physical devices

## Features

### Core Functionality
- **Manual ticket tracking**: Add any support ticket with company name, ticket ID, submission date, and description
- **Smart status detection**: Paste email confirmation or support page URL to auto-extract ticket details
- **One-tap follow-ups**: Generate follow-up messages when tickets are overdue
- **Timeline view**: See all tickets in one feed with color-coded urgency indicators
- **Delay insights**: Track company response times and resolution statistics

### Technical Stack
- React Native (Expo)
- SQLite for local data storage
- Expo Notifications for push alerts
- Expo Task Manager for background checks
- Axios for HTTP requests
- Date-fns for date handling

## Development

### Available Scripts
- `npm start`: Start the development server
- `npm test`: Run tests
- `npm run android`: Run on Android device/emulator
- `npm run ios`: Run on iOS simulator/device

### Project Structure
- `/app`: Main application screens and navigation
- `/components`: Reusable UI components
- `/lib`: Core libraries (database, notifications, parsers)
- `/hooks`: Custom React hooks
- `/constants`: Configuration values
- `/__tests__`: Unit and integration tests

### Testing
Run all tests with `npm test`. The project includes:
- Database operation tests
- Ticket parsing tests
- Follow-up generation tests
- Component rendering tests

## Monetization Strategy

### Free Tier
- Track up to 3 active tickets
- Basic push notifications
- Manual entry only
- 30-day history

### Pro Version ($4.99/month)
- Unlimited active tickets
- Smart extraction from emails/screenshots
- Custom response time expectations
- Advanced follow-up templates
- Full history and export capabilities

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## License

MIT License - see LICENSE file for details.
