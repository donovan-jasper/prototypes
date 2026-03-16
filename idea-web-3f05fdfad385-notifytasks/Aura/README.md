# Aura

Aura is a productivity app designed to help you declutter your mind by capturing, organizing, and conquering your day at a glance, without ever opening an app.

## Features

- **Zero-Friction Capture**: Instantly add notes, tasks, or reminders via dedicated Home Screen widgets (iOS/Android), persistent actionable notifications (Android), or a quick action within the main app.
- **Dynamic Glanceable Interfaces**: Display active items across Lock Screen widgets (iOS/Android), Home Screen widgets (iOS/Android), Live Activities (iOS), and persistent, actionable notifications (Android). Content updates dynamically.
- **One-Tap Interaction**: Complete tasks, snooze reminders, or open for quick edit directly from any glanceable interface (widget, notification, Live Activity) without launching the full app.
- **Flexible Item Types**: Support for simple text notes, actionable tasks (checkboxes), and time-based reminders with optional recurring settings.

## Tech Stack

- **Frontend**: React Native (Expo managed workflow)
- **Local Storage**: SQLite (via `expo-sqlite`)
- **State Management**: React Context API
- **Notifications/Widgets**: `expo-notifications`, `expo-widget-kit`

## Setup

1. **Prerequisites**:
   - Node.js (v16 or later)
   - npm or yarn
   - Expo CLI (`npm install -g expo-cli`)
   - Xcode (for iOS development)
   - Android Studio (for Android development)

2. **Installation**:
   
