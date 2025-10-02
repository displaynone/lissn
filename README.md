# Lissn

Lissn is a local music player built with [Expo](https://expo.dev) and React Native. The project indexes the device's audio library, stores metadata in a database, and lets you play songs with controls in the system notification.

## Features

- 📂 **Library sync**: scans the device and stores songs, artists, albums, and genres using [WatermelonDB](https://nozbe.github.io/WatermelonDB/).
- 🎧 **Audio playback**: powered by `expo-audio` and a native service to show playback controls in the notification.
- 🗃️ **Local database**: all metadata is stored locally for fast queries and offline use.
- 🧩 **Cross-platform UI**: built with [Tamagui](https://tamagui.dev) and navigation via `expo-router`.
- 🌍 **Internationalization**: managed with [Lingui](https://lingui.dev).

## Requirements

- Node.js and npm
- Expo CLI (`npm install -g expo-cli`)
- Android or iOS environment set up (Android Studio, Xcode, etc.)

## Installation

```bash
npm install
```

## Run in development

```bash
npx expo start
```

After starting, you can open the app in:

- a development build (`expo run:android` / `expo run:ios`)
- an Android emulator or iOS simulator
- [Expo Go](https://expo.dev/go)

## Sync the music library

The `MusicLibraryService` class requests permissions and traverses all audio files on the device to populate the database. You can trigger a sync from your code:

```ts
import { MusicLibraryService } from '@/services/MusicLibraryService';

await MusicLibraryService.getInstance().syncLibrary();
```

## Native code

The `android/app/src/main/java` folder includes a native module (`ExpoMusicLibrary`) written in Kotlin. This module is largely copied from [dev-josias/expo-music-library](https://github.com/dev-josias/expo-music-library); the original project had a bug associating album IDs, and that issue remains unresolved here.

## Releases

Releases are automated with semantic-release. Conventional Commits are required (commitlint enforces them). Run `npm run release` in CI or locally with Node.js 18.17+ and set these environment variables before executing:

- `GITHUB_TOKEN`: personal access token with `repo` scope so semantic-release can create tags and GitHub releases.
- `GH_TOKEN`: optional alias that semantic-release checks if `GITHUB_TOKEN` is not set.

The release pipeline updates `CHANGELOG.md`, bumps the version in `package.json`/`package-lock.json`, and publishes a GitHub release (npm publishing is disabled).

## License

This project is distributed under the same license as the repository from which the Kotlin module was derived.
