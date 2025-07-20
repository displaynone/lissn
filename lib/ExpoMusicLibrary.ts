import { NativeModules } from 'react-native';

/**
 * Permission status returned by permission methods
 */
export type PermissionStatus = "granted" | "denied";

/**
 * Response from permission methods
 */
export interface PermissionResponse {
  status: PermissionStatus;
}

/**
 * Sort options for querying assets
 */
export type SortByKey = "default" | "creationTime" | "modificationTime" | "duration";

/**
 * Options for querying music assets
 */
export interface AssetsOptions {
  /**
   * Maximum number of assets to return
   * @default 100
   */
  first?: number;

  /**
   * Cursor for pagination
   */
  after?: string;

  /**
   * Filter by album name
   */
  album?: string;

  /**
   * Array of sort criteria. Each item should be in format "key direction"
   * Example: ["creationTime DESC", "title ASC"]
   */
  sortBy?: string[];

  /**
   * Filter assets created after this timestamp
   */
  createdAfter?: number;

  /**
   * Filter assets created before this timestamp
   */
  createdBefore?: number;
}

/**
 * Audio asset from device storage
 */
export interface Audio {
  /**
   * Unique identifier for the audio file
   */
  id: string;

  /**
   * Display title of the audio file
   */
  title: string;

  /**
   * Artist name
   */
  artist: string;

  /**
   * URI to album artwork
   */
  artwork: string;

  /**
   * Original filename
   */
  filename: string;

  /**
   * File URI for accessing the audio file
   */
  uri: string;

  /**
   * Media type (typically "audio")
   */
  mediaType: string;

  /**
   * Creation timestamp
   */
  creationTime: number;

  /**
   * Last modification timestamp
   */
  modificationTime: number;

  /**
   * Duration in seconds
   */
  duration: number;

  /**
   * Album ID this track belongs to
   */
  albumId: string;

  /**
   * Artist ID this track belongs to
   */
  artistId: string;

  /**
   * Genre ID this track belongs to
   */
  genreId: string;
}

/**
 * Album information
 */
export interface Album {
  /**
   * Unique album identifier
   */
  id: string;

  /**
   * Album title
   */
  title: string;

  /**
   * Album artwork URI
   */
  artwork: string;

  /**
   * Album artist
   */
  artist: string;

  /**
   * Number of assets in this album
   */
  assetsCount: number;

  /**
   * Total number of songs in the album
   */
  albumSongs: number;
}

/**
 * Artist information
 */
export interface Artist {
  /**
   * Unique artist identifier
   */
  id: string;

  /**
   * Artist name
   */
  title: string;

  /**
   * Number of assets by this artist
   */
  assetCount: number;

  /**
   * Total number of songs by this artist
   */
  artistSongs: number;
}

/**
 * Genre information
 */
export interface Genre {
  /**
   * Unique genre identifier
   */
  id: string;

  /**
   * Genre name
   */
  title: string;

  /**
   * Number of assets in this genre
   */
  assetCount: number;
}

/**
 * Folder information
 */
export interface Folder {
  /**
   * Unique folder identifier
   */
  id: string;

  /**
   * Folder name
   */
  title: string;
}

/**
 * Native module interface for accessing device music library
 */
interface ExpoMusicLibraryModule {
  /**
   * Check current permission status for media library access
   */
  getPermissionsAsync(): Promise<PermissionResponse>;

  /**
   * Request permission to access media library
   */
  requestPermissionsAsync(): Promise<PermissionResponse>;

  /**
   * Get music assets from device storage
   */
  getAssetsAsync(options?: AssetsOptions): Promise<Audio[]>;

  /**
   * Get all albums from device storage
   */
  getAlbumsAsync(): Promise<Album[]>;

  /**
   * Get all assets from a specific album
   */
  getAlbumAssetsAsync(albumName: string): Promise<Audio[]>;

  /**
   * Get all artists from device storage
   */
  getArtistsAsync(): Promise<Artist[]>;

  /**
   * Get all assets from a specific artist
   */
  getArtistAssetsAsync(artistId: string): Promise<Audio[]>;

  /**
   * Get all genres from device storage
   */
  getGenresAsync(): Promise<Genre[]>;

  /**
   * Get all assets from a specific genre
   */
  getGenreAssetsAsync(genreId: string): Promise<Audio[]>;

  /**
   * Get all folders from device storage
   */
  getFoldersAsync(): Promise<Folder[]>;

  /**
   * Get all assets from a specific folder
   */
  getFolderAssetsAsync(folderId: string): Promise<Audio[]>;
}

// Get the native module with type safety
const { ExpoMusicLibrary } = NativeModules as {
  ExpoMusicLibrary: ExpoMusicLibraryModule;
};

if (!ExpoMusicLibrary) {
  throw new Error(
    'ExpoMusicLibrary native module is not available. Make sure you have installed the native dependencies and rebuilt your app.'
  );
}

/**
 * Typed wrapper for ExpoMusicLibrary native module
 *
 * Provides access to device music library with full TypeScript support
 *
 * @example
 * ```typescript
 * import MusicLibrary from '@/lib/ExpoMusicLibrary';
 *
 * // Check permissions
 * const { status } = await MusicLibrary.getPermissionsAsync();
 *
 * // Get music assets
 * const songs = await MusicLibrary.getAssetsAsync({
 *   first: 100,
 *   sortBy: ['creationTime DESC']
 * });
 * ```
 */
export default ExpoMusicLibrary;