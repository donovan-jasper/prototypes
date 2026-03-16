# ChapterCast

Turn any audio into a chaptered audiobook — organize lectures, podcasts, and recordings with smart chapters and offline playback.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Smart Import & Auto-Chapter**: Import multiple audio files and automatically detect chapter breaks.
- **Audiobook Player with Memory**: Remember playback position and navigate through chapters.
- **Offline Processing & Export**: Merge files and embed chapters without internet.
- **Library Management**: Organize and manage your audiobooks.
- **Playback Analytics**: Track your listening habits (paid tier).

## Tech Stack

- **React Native (Expo SDK 52+)**
- **expo-av**: Audio playback and metadata
- **expo-file-system**: Local file management
- **expo-document-picker**: Import audio files
- **expo-media-library**: Access device audio library
- **SQLite (expo-sqlite)**: Store audiobook metadata, chapters, playback progress
- **react-native-track-player**: Advanced playback controls
- **ffmpeg-kit-react-native**: Audio processing
- **zustand**: Lightweight state management
- **React Navigation**: Tab and stack navigation

## Installation

1. Clone the repository:
   
