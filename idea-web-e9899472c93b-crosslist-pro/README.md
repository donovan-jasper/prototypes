# ListSync - Multi-Channel E-commerce Listing Manager

Sell everywhere, manage from anywhere — one tap to list products across Amazon, eBay, Shopify, and more.

## Overview

ListSync is a React Native application that allows small-scale sellers to manage their inventory across multiple e-commerce platforms from a single interface. The app takes care of platform-specific listing requirements, inventory synchronization, and price optimization.

## Features

- **Smart Product Creator**: Take/upload photos, add title/description/price once, then publish to multiple platforms
- **Unified Inventory Dashboard**: View and manage all listings in one place
- **Real-time Stock Sync**: Automatically update quantities across platforms when items sell
- **Platform Connectors**: Secure OAuth integration with Amazon, eBay, Shopify
- **Price Optimizer**: AI-powered pricing suggestions based on competitor analysis
- **Bulk Actions**: Import/export products via CSV, mass updates

## Tech Stack

- **Framework**: React Native (Expo SDK 52+)
- **Language**: TypeScript
- **Local Storage**: SQLite (expo-sqlite)
- **State Management**: Zustand
- **API Client**: Axios
- **Image Handling**: expo-image-picker + expo-image-manipulator
- **Background Sync**: expo-task-manager + expo-background-fetch
- **Push Notifications**: expo-notifications

## Setup Instructions

1. Clone the repository:
