# Lissn

Lissn es un reproductor de música local construido con [Expo](https://expo.dev) y React Native. El proyecto indexa la biblioteca de audio del dispositivo, guarda los metadatos en una base de datos y permite reproducir canciones con controles en la notificación del sistema.

## Características

- 📂 **Sincronización de biblioteca**: escanea el dispositivo y almacena canciones, artistas, álbumes y géneros usando [WatermelonDB](https://nozbe.github.io/WatermelonDB/).
- 🎧 **Reproducción de audio**: se apoya en `expo-audio` y un servicio nativo para mostrar controles de reproducción en la notificación.
- 🗃️ **Base de datos local**: todos los metadatos se guardan localmente para consultas rápidas y uso sin conexión.
- 🧩 **UI multiplataforma**: creada con [Tamagui](https://tamagui.dev) y navegación mediante `expo-router`.
- 🌍 **Internacionalización**: gestionada con [Lingui](https://lingui.dev).

## Requisitos

- Node.js y npm
- Expo CLI (`npm install -g expo-cli`)
- Entorno Android o iOS configurado (Android Studio, Xcode, etc.)

## Instalación

```bash
npm install
```

## Ejecutar en modo desarrollo

```bash
npx expo start
```

Tras iniciar, puedes abrir la app en:

- un build de desarrollo (`expo run:android` / `expo run:ios`)
- un emulador de Android o simulador de iOS
- [Expo Go](https://expo.dev/go)

## Sincronizar la biblioteca musical

La clase `MusicLibraryService` solicita permisos y recorre todos los archivos de audio del dispositivo para llenar la base de datos. Puedes iniciar una sincronización desde tu código:

```ts
import { MusicLibraryService } from '@/services/MusicLibraryService';

await MusicLibraryService.getInstance().syncLibrary();
```

## Código nativo

La carpeta `android/app/src/main/java` incluye un módulo nativo (`ExpoMusicLibrary`) escrito en Kotlin. Este módulo es en gran parte una copia de [dev-josias/expo-music-library](https://github.com/dev-josias/expo-music-library); el proyecto original contenía un fallo al asociar los IDs de los álbumes y dicho bug aún no se ha corregido aquí.

## Licencia

Este proyecto se distribuye con la misma licencia que el repositorio original del que se derivó el módulo Kotlin.

