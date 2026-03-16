# MotiMorph

## Overview

MotiMorph is a mobile application designed to provide daily motivational affirmations tailored to the user's needs and patterns. It adapts to the user's engagement, offering the right words at the right moment to boost motivation and support personal growth.

## Features

- **Smart Timing Engine**: Learns optimal notification times based on user engagement.
- **Contextual Affirmation Library**: Provides affirmations categorized by energy level, time of day, streak status, and emotional tone.
- **Streak Visualization**: Tracks daily check-ins with a visual calendar and milestone celebrations.
- **Mood Check-in**: Allows users to rate their mood after reading affirmations, influencing future messages.
- **Goal Anchoring**: Users can set personal goals, with affirmations subtly referencing these goals.

## Tech Stack

- **Framework**: React Native (Expo SDK 52+)
- **Local storage**: SQLite (expo-sqlite)
- **Notifications**: expo-notifications
- **State management**: Zustand
- **Date handling**: date-fns
- **Testing**: Jest + React Native Testing Library
- **AI integration (premium)**: OpenAI API (GPT-4o-mini)
- **Analytics**: Expo Analytics

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio or Xcode (for running on physical devices)

### Installation

1. Clone the repository:
   
