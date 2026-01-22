# AquaXone Mobile 📱

Smart Aquarium Tracking - Mobile App for iOS & Android

## Tech Stack

- **Expo SDK 52** - React Native framework
- **Expo Router** - File-based navigation
- **NativeWind** - Tailwind CSS for React Native
- **Supabase** - Backend (shared with web app)
- **TypeScript** - Type safety

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your phone (for testing)

### Installation

```bash
cd mobile
npm install
```

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Add your Supabase credentials (same as web app):
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Building for Production

#### Setup EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure
```

#### Update eas.json

Edit `eas.json` with your Apple/Google credentials:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

#### Build & Submit

```bash
# Build for iOS
npm run build:ios

# Build for Android
npm run build:android

# Build both
npm run build:all

# Submit to App Store
npm run submit:ios

# Submit to Play Store
npm run submit:android
```

## Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens (login, register, etc.)
│   ├── (tabs)/            # Main tab screens
│   │   ├── index.tsx      # Dashboard
│   │   ├── log.tsx        # Parameter logging
│   │   ├── history.tsx    # History & charts
│   │   ├── maintenance.tsx # Maintenance tracking
│   │   └── more.tsx       # Settings & more
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry redirect
├── src/
│   ├── components/        # Reusable components
│   ├── constants/         # Theme, colors, config
│   ├── context/           # React contexts
│   ├── lib/              # Supabase, storage utils
│   └── styles/           # Global CSS
├── assets/
│   └── images/           # App icons, splash screens
├── app.json              # Expo config
├── eas.json              # EAS Build config
├── package.json
└── tsconfig.json
```

## Features

- ✅ Authentication (Supabase)
- ✅ Reef & Freshwater modes
- ✅ Tank management
- ✅ Parameter logging
- ✅ History with charts
- ✅ Maintenance tracking
- ✅ Subscription tiers
- 🔜 Push notifications
- 🔜 Offline mode
- 🔜 Gallery with camera

## App Store Checklist

### iOS (App Store Connect)
- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect app created
- [ ] App icons (1024x1024)
- [ ] Screenshots (various sizes)
- [ ] Privacy policy URL
- [ ] App description & keywords

### Android (Google Play Console)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] App listing created
- [ ] App icons (512x512)
- [ ] Screenshots
- [ ] Privacy policy URL
- [ ] Content rating questionnaire

## Shared Code

The `/shared` folder contains types and utilities shared between web and mobile:

```
shared/
└── types/
    └── index.ts    # TypeScript types
```

## Support

Created by CODEWERX for AquaXone
