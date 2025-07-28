# ExpoMusicLibrary TypeScript Wrapper

Este módulo proporciona acceso tipado a la biblioteca de música del dispositivo a través de React Native.

## Instalación

El módulo nativo ya está configurado en el proyecto. Solo importa el wrapper tipado:

```typescript
import MusicLibrary, { Audio, Album, Artist } from '@/lib/ExpoMusicLibrary';
```

## Uso Básico

### Verificar y Solicitar Permisos

```typescript
import MusicLibrary from '@/lib/ExpoMusicLibrary';

// Verificar permisos actuales
const { status } = await MusicLibrary.getPermissionsAsync();

if (status !== 'granted') {
  // Solicitar permisos
  const { status: newStatus } = await MusicLibrary.requestPermissionsAsync();
  if (newStatus !== 'granted') {
    console.log('Denied permissions');
    return;
  }
}
```

### Obtener Archivos de Audio

```typescript
// Obtener todos los archivos de audio
const songs = await MusicLibrary.getAssetsAsync();

// Con opciones de filtrado y ordenamiento
const songs = await MusicLibrary.getAssetsAsync({
  first: 100,                          // Máximo 100 archivos
  sortBy: ['creationTime DESC'],       // Ordenar por fecha de creación
  createdAfter: Date.now() - 86400000  // Solo archivos del último día
});
```

### Obtener Álbumes, Artistas y Géneros

```typescript
// Obtener todos los álbumes
const albums = await MusicLibrary.getAlbumsAsync();

// Obtener todos los artistas
const artists = await MusicLibrary.getArtistsAsync();

// Obtener todos los géneros
const genres = await MusicLibrary.getGenresAsync();

// Obtener todos los folders
const folders = await MusicLibrary.getFoldersAsync();
```

### Obtener Archivos por Categoría

```typescript
// Obtener canciones de un álbum específico
const albumSongs = await MusicLibrary.getAlbumAssetsAsync('album-id');

// Obtener canciones de un artista específico
const artistSongs = await MusicLibrary.getArtistAssetsAsync('artist-id');

// Obtener canciones de un género específico
const genreSongs = await MusicLibrary.getGenreAssetsAsync('genre-id');

// Obtener canciones de una carpeta específica
const folderSongs = await MusicLibrary.getFolderAssetsAsync('folder-id');
```

## Tipos TypeScript

### Audio

```typescript
interface Audio {
  id: string;              // ID único del archivo
  title: string;           // Título de la canción
  artist: string;          // Nombre del artista
  artwork: string;         // URI de la portada del álbum
  filename: string;        // Nombre original del archivo
  uri: string;             // URI para acceder al archivo
  mediaType: string;       // Tipo de media ("audio")
  creationTime: number;    // Timestamp de creación
  modificationTime: number; // Timestamp de modificación
  duration: number;        // Duración en segundos
  albumId: string;         // ID del álbum
  artistId: string;        // ID del artista
  genreId: string;         // ID del género
}
```

### Album

```typescript
interface Album {
  id: string;              // ID único del álbum
  title: string;           // Título del álbum
  artwork: string;         // URI de la portada
  artist: string;          // Artista del álbum
  assetsCount: number;     // Número de assets en el álbum
  albumSongs: number;      // Número total de canciones
}
```

### Artist

```typescript
interface Artist {
  id: string;              // ID único del artista
  title: string;           // Nombre del artista
  assetCount: number;      // Número de assets del artista
  artistSongs: number;     // Número total de canciones
}
```

### AssetsOptions

```typescript
interface AssetsOptions {
  first?: number;          // Máximo número de assets a retornar
  after?: string;          // Cursor para paginación
  album?: string;          // Filtrar por nombre de álbum
  sortBy?: string[];       // Criterios de ordenamiento ["key direction"]
  createdAfter?: number;   // Filtrar assets creados después de timestamp
  createdBefore?: number;  // Filtrar assets creados antes de timestamp
}
```

## Opciones de Ordenamiento

Las opciones `sortBy` deben especificar tanto la clave como la dirección:

```typescript
// Claves disponibles
type SortByKey = "default" | "creationTime" | "modificationTime" | "duration";

// Ejemplos de uso
const songs = await MusicLibrary.getAssetsAsync({
  sortBy: [
    'creationTime DESC',    // Por fecha de creación, descendente
    'title ASC',            // Luego por título, ascendente
    'duration DESC'         // Luego por duración, descendente
  ]
});
```

## Manejo de Errores

```typescript
try {
  const songs = await MusicLibrary.getAssetsAsync();
  // Usar songs...
} catch (error) {
  console.error('Error cargando música:', error);

  // Los errores comunes incluyen:
  // - "NO_PERMISSIONS": Permisos no otorgados
  // - "ASSETS_ERROR": Error general de assets
  // - "E_NO_ACTIVITY": No hay actividad disponible para permisos
}
```

## Uso con Context Provider

```typescript
import { useAudioLibrary } from '@/hooks/providers/MediaLibraryProvider';

function MusicComponent() {
  const { loading, songs } = useAudioLibrary();

  if (loading) {
    return <Text>Cargando música...</Text>;
  }

  return (
    <View>
      {songs?.map(song => (
        <Text key={song.id}>{song.title} - {song.artist}</Text>
      ))}
    </View>
  );
}
```

## Permisos de Android

El módulo maneja automáticamente los permisos requeridos:

- **Android 13+**: `READ_MEDIA_AUDIO`, `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`
- **Android <13**: `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`

Los permisos están configurados en `android/app/src/main/AndroidManifest.xml`.