# FileVault

Share files instantly with military-grade encryption — no signup, no tracking, no limits on who you send to.

## Features

• **Instant encrypted sharing** — Tap a file, generate a secure link, share via any app with auto-expiring links
• **Camera-to-encrypted-file** — Snap photos/documents that are instantly encrypted and ready to share
• **Offline P2P transfer** — Direct WiFi transfers between devices without internet or cloud dependency

## Monetization

Freemium model with $4.99/month premium tier for unlimited shares, larger file sizes, and custom expiration options.

## Tech Stack

• React Native (Expo SDK 52+)
• AES-256-GCM encryption via `react-native-quick-crypto`
• SQLite for local storage via `expo-sqlite`
• WebRTC for P2P transfers
• Expo File System for secure local storage

## Running

Run `npx create-expo-app@latest filevault --template tabs` then install dependencies with `npx expo install`.

## Status

Prototype
