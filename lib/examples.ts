/**
 * Ejemplos de uso avanzado de ExpoMusicLibrary
 */

import MusicLibrary, {
    Album,
    Artist,
    AssetsOptions,
    Audio
} from '@/lib/ExpoMusicLibrary';

// ===============================================
// 🎵 EJEMPLOS BÁSICOS
// ===============================================

/**
 * Función utilitaria para verificar y solicitar permisos
 */
export async function ensurePermissions(): Promise<boolean> {
  try {
    const { status } = await MusicLibrary.getPermissionsAsync();

    if (status === 'granted') {
      return true;
    }

    const { status: newStatus } = await MusicLibrary.requestPermissionsAsync();
    return newStatus === 'granted';
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

/**
 * Obtener todas las canciones con manejo de errores
 */
export async function getAllSongs(): Promise<Audio[]> {
  if (!(await ensurePermissions())) {
    throw new Error('Permisos de música no otorgados');
  }

  try {
    return await MusicLibrary.getAssetsAsync({
      first: 5000,
      sortBy: ['title ASC']
    });
  } catch (error) {
    console.error('Error loading songs:', error);
    return [];
  }
}

// ===============================================
// 🎯 BÚSQUEDA Y FILTRADO AVANZADO
// ===============================================

/**
 * Buscar canciones por texto (título o artista)
 */
export async function searchSongs(query: string): Promise<Audio[]> {
  const allSongs = await getAllSongs();
  const searchTerm = query.toLowerCase();

  return allSongs.filter(song =>
    song.title.toLowerCase().includes(searchTerm) ||
    song.artist.toLowerCase().includes(searchTerm)
  );
}

/**
 * Obtener canciones por duración (en segundos)
 */
export async function getSongsByDuration(
  minDuration: number,
  maxDuration: number
): Promise<Audio[]> {
  const allSongs = await getAllSongs();

  return allSongs.filter(song =>
    song.duration >= minDuration && song.duration <= maxDuration
  );
}

/**
 * Obtener canciones agregadas recientemente (últimos N días)
 */
export async function getRecentSongs(days: number = 7): Promise<Audio[]> {
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

  return await MusicLibrary.getAssetsAsync({
    first: 1000,
    createdAfter: cutoffTime,
    sortBy: ['creationTime DESC']
  });
}

// ===============================================
// 📊 ESTADÍSTICAS Y ANÁLISIS
// ===============================================

/**
 * Obtener estadísticas de la biblioteca de música
 */
export async function getMusicLibraryStats() {
  const [songs, albums, artists, genres] = await Promise.all([
    getAllSongs(),
    MusicLibrary.getAlbumsAsync(),
    MusicLibrary.getArtistsAsync(),
    MusicLibrary.getGenresAsync()
  ]);

  const totalDuration = songs.reduce((total, song) => total + song.duration, 0);
  const averageDuration = totalDuration / songs.length;

  return {
    totalSongs: songs.length,
    totalAlbums: albums.length,
    totalArtists: artists.length,
    totalGenres: genres.length,
    totalDurationHours: Math.round(totalDuration / 3600 * 100) / 100,
    averageSongDuration: Math.round(averageDuration),
    oldestSong: songs.reduce((oldest, song) =>
      song.creationTime < oldest.creationTime ? song : oldest
    ),
    newestSong: songs.reduce((newest, song) =>
      song.creationTime > newest.creationTime ? song : newest
    )
  };
}

/**
 * Obtener los artistas más populares (por número de canciones)
 */
export async function getTopArtists(limit: number = 10): Promise<Artist[]> {
  const artists = await MusicLibrary.getArtistsAsync();

  return artists
    .sort((a, b) => b.artistSongs - a.artistSongs)
    .slice(0, limit);
}

/**
 * Obtener álbumes con más canciones
 */
export async function getTopAlbums(limit: number = 10): Promise<Album[]> {
  const albums = await MusicLibrary.getAlbumsAsync();

  return albums
    .sort((a, b) => b.albumSongs - a.albumSongs)
    .slice(0, limit);
}

// ===============================================
// 🎲 FUNCIONES DE PLAYLIST
// ===============================================

/**
 * Crear una playlist aleatoria
 */
export async function createRandomPlaylist(size: number = 50): Promise<Audio[]> {
  const allSongs = await getAllSongs();
  const shuffled = [...allSongs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, size);
}

/**
 * Crear playlist de un artista específico
 */
export async function createArtistPlaylist(artistId: string): Promise<Audio[]> {
  try {
    return await MusicLibrary.getArtistAssetsAsync(artistId);
  } catch (error) {
    console.error('Error creating artist playlist:', error);
    return [];
  }
}

/**
 * Crear playlist de canciones cortas (menos de 3 minutos)
 */
export async function createShortSongsPlaylist(): Promise<Audio[]> {
  return await getSongsByDuration(0, 180); // 3 minutos = 180 segundos
}

/**
 * Crear playlist de canciones largas (más de 5 minutos)
 */
export async function createLongSongsPlaylist(): Promise<Audio[]> {
  return await getSongsByDuration(300, Infinity); // 5 minutos = 300 segundos
}

// ===============================================
// 🔄 FUNCIONES DE UTILIDAD
// ===============================================

/**
 * Formatear duración en formato MM:SS o HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Obtener el nombre del archivo sin extensión
 */
export function getFileNameWithoutExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

/**
 * Verificar si una canción tiene portada
 */
export function hasArtwork(song: Audio): boolean {
  return Boolean(song.artwork && song.artwork.length > 0 && !song.artwork.includes('default'));
}

/**
 * Agrupar canciones por artista
 */
export function groupSongsByArtist(songs: Audio[]): Record<string, Audio[]> {
  return songs.reduce((groups, song) => {
    const artist = song.artist || 'Unknown Artist';
    if (!groups[artist]) {
      groups[artist] = [];
    }
    groups[artist].push(song);
    return groups;
  }, {} as Record<string, Audio[]>);
}

/**
 * Agrupar canciones por álbum
 */
export function groupSongsByAlbum(songs: Audio[]): Record<string, Audio[]> {
  return songs.reduce((groups, song) => {
    const album = song.albumId || 'Unknown Album';
    if (!groups[album]) {
      groups[album] = [];
    }
    groups[album].push(song);
    return groups;
  }, {} as Record<string, Audio[]>);
}

// ===============================================
// 🎯 EJEMPLOS DE USO COMPLETO
// ===============================================

/**
 * Ejemplo completo: Dashboard de música
 */
export async function createMusicDashboard() {
  try {
    const [stats, topArtists, topAlbums, recentSongs] = await Promise.all([
      getMusicLibraryStats(),
      getTopArtists(5),
      getTopAlbums(5),
      getRecentSongs(30)
    ]);

    return {
      stats,
      topArtists,
      topAlbums,
      recentSongs,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating dashboard:', error);
    throw error;
  }
}

/**
 * Ejemplo completo: Explorador de música por categorías
 */
export async function createMusicExplorer() {
  try {
    const [albums, artists, genres, folders] = await Promise.all([
      MusicLibrary.getAlbumsAsync(),
      MusicLibrary.getArtistsAsync(),
      MusicLibrary.getGenresAsync(),
      MusicLibrary.getFoldersAsync()
    ]);

    return {
      categories: {
        albums: albums.slice(0, 20),
        artists: artists.slice(0, 20),
        genres: genres.slice(0, 20),
        folders: folders.slice(0, 20)
      },
      counts: {
        totalAlbums: albums.length,
        totalArtists: artists.length,
        totalGenres: genres.length,
        totalFolders: folders.length
      }
    };
  } catch (error) {
    console.error('Error creating explorer:', error);
    throw error;
  }
}

/**
 * Ejemplo de configuración de opciones avanzadas
 */
export const advancedSearchOptions: AssetsOptions = {
  first: 1000,
  sortBy: [
    'creationTime DESC',  // Primero por fecha de creación
    'title ASC',          // Luego por título
    'artist ASC'          // Finalmente por artista
  ],
  createdAfter: Date.now() - (365 * 24 * 60 * 60 * 1000), // Último año
};

// ===============================================
// 📝 TIPOS DE UTILIDAD
// ===============================================

export type MusicStats = Awaited<ReturnType<typeof getMusicLibraryStats>>;
export type MusicDashboard = Awaited<ReturnType<typeof createMusicDashboard>>;
export type MusicExplorer = Awaited<ReturnType<typeof createMusicExplorer>>;
export type SongsByArtist = ReturnType<typeof groupSongsByArtist>;
export type SongsByAlbum = ReturnType<typeof groupSongsByAlbum>;