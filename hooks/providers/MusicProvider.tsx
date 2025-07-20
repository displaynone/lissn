// providers/MusicProvider.tsx
import { database } from "@/database";
import { Album, Artist, Song } from "@/models";
import {
	MusicLibraryService,
	SyncProgress,
} from "@/services/MusicLibraryService";
import { Q } from "@nozbe/watermelondb";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { Observable } from "rxjs";

type MusicContextValue = {
	// Songs state
	songs: Song[];
	artists: Artist[];
	albums: Album[];
	isLoading: boolean;

	// Sync state
	syncProgress: SyncProgress | null;
	isSyncing: boolean;

	// Recovery state
	isRecovering: boolean;
	recoveryMessage: string | null;

	// CRUD operations for songs
	refreshSongs: () => Promise<void>;
	getSongById: (id: string) => Promise<Song | null>;
	updateSong: (id: string, updates: Partial<Song>) => Promise<void>;
	toggleFavorite: (id: string) => Promise<void>;
	incrementPlayCount: (id: string) => Promise<void>;

	// Search and filtering operations
	searchSongs: (query: string) => Promise<Song[]>;
	getSongsByArtist: (artistId: string) => Promise<Song[]>;
	getSongsByAlbum: (albumId: string) => Promise<Song[]>;
	getFavoriteSongs: () => Promise<Song[]>;
	getRecentlyPlayed: () => Promise<Song[]>;

	// Sync control
	startSync: () => Promise<void>;
	clearDatabase: () => Promise<void>;
	getLibraryStats: () => Promise<any>;
};

const MusicContext = createContext<MusicContextValue | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// Main states
	const [songs, setSongs] = useState<Song[]>([]);
	const [artists, setArtists] = useState<Artist[]>([]);
	const [albums, setAlbums] = useState<Album[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Sync states
	const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
	const [isSyncing, setIsSyncing] = useState(false);

	// Recovery states
	const [isRecovering, setIsRecovering] = useState(false);
	const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

	const musicService = MusicLibraryService.getInstance();

	// Helper function to check if error is database-related
	const isDatabaseError = (error: unknown): boolean => {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return errorMessage.includes("no such column") ||
			errorMessage.includes("SQLiteException") ||
			errorMessage.includes("sqlite");
	};

	// Auto-recovery function for database errors
	const autoRecoverDatabase = useCallback(async (error: unknown) => {
		console.error("Database error detected, attempting auto-recovery:", error);

		setIsRecovering(true);
		setRecoveryMessage("Detectado error de base de datos. Recuperando automáticamente...");

		try {
			// Clear the database
			setRecoveryMessage("Limpiando base de datos...");
			await musicService.clearDatabase();

			// Wait a moment for cleanup
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Restart sync
			setRecoveryMessage("Resincronizando biblioteca musical...");
			await startSync();

			setRecoveryMessage("Recuperación completada exitosamente");

			// Clear recovery message after success
			setTimeout(() => {
				setRecoveryMessage(null);
			}, 3000);

		} catch (recoveryError) {
			console.error("Auto-recovery failed:", recoveryError);
			setRecoveryMessage("Error en recuperación automática. Usa las herramientas manuales.");

			// Keep error message longer for manual intervention
			setTimeout(() => {
				setRecoveryMessage(null);
			}, 10000);
		} finally {
			setIsRecovering(false);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [musicService]);

	// Initialize database observers with error handling
	useEffect(() => {
		let songsSubscription: any;
		let artistsSubscription: any;
		let albumsSubscription: any;

		const initializeObservers = async () => {
			try {
				// Songs observer
				const songsCollection = database.get<Song>("songs");
				const songsObservable: Observable<Song[]> = songsCollection
					.query(Q.sortBy("created_at", Q.desc))
					.observe();

				songsSubscription = songsObservable.subscribe({
					next: (results) => {
						setSongs(results);
						setIsLoading(false);
					},
					error: (error) => {
						console.error("Error in songs observer:", error);
						// Check if it's a schema-related error
						if (isDatabaseError(error)) {
							autoRecoverDatabase(error);
						} else {
							setIsLoading(false);
						}
					}
				});

				// Artists observer
				const artistsCollection = database.get<Artist>("artists");
				const artistsObservable: Observable<Artist[]> = artistsCollection
					.query(Q.sortBy("name", Q.asc))
					.observe();

				artistsSubscription = artistsObservable.subscribe({
					next: (results) => {
						setArtists(results);
					},
					error: (error) => {
						console.error("Error in artists observer:", error);
						if (isDatabaseError(error)) {
							autoRecoverDatabase(error);
						}
					}
				});

				// Albums observer
				const albumsCollection = database.get<Album>("albums");
				const albumsObservable: Observable<Album[]> = albumsCollection
					.query(Q.sortBy("title", Q.asc))
					.observe();

				albumsSubscription = albumsObservable.subscribe({
					next: (results) => {
						setAlbums(results);
					},
					error: (error) => {
						console.error("Error in albums observer:", error);
						if (isDatabaseError(error)) {
							autoRecoverDatabase(error);
						}
					}
				});

			} catch (error) {
				console.error("Error initializing observers:", error);
				// If there's an error setting up observers, try auto-recovery
				if (isDatabaseError(error)) {
					autoRecoverDatabase(error);
				} else {
					setIsLoading(false);
				}
			}
		};

		initializeObservers();

		return () => {
			songsSubscription?.unsubscribe();
			artistsSubscription?.unsubscribe();
			albumsSubscription?.unsubscribe();
		};
	}, [autoRecoverDatabase]);

	// Sync control
	const startSync = useCallback(async () => {
		if (isSyncing || isRecovering) return;

		setIsSyncing(true);
		try {
			await musicService.syncLibrary((progress) => {
				setSyncProgress(progress);
			});
		} catch (error) {
			console.error("Error during sync:", error);
			// Check if sync error is database-related
			if (isDatabaseError(error)) {
				await autoRecoverDatabase(error);
			}
		} finally {
			setIsSyncing(false);
			setSyncProgress(null);
		}
	}, [isSyncing, isRecovering, musicService, autoRecoverDatabase]);

	// Initialize automatic sync with error handling
	useEffect(() => {
		const initializeLibrary = async () => {
			try {
				const stats = await musicService.getLibraryStats();
				if (stats.songsCount === 0) {
					// If no songs, start automatic sync
					await startSync();
				}
			} catch (error) {
				console.error("Error initializing library:", error);
				// Check if initialization error is database-related
				if (isDatabaseError(error)) {
					await autoRecoverDatabase(error);
				}
			}
		};

		// Delay initialization to allow observers to set up first
		const timer = setTimeout(initializeLibrary, 1000);
		return () => clearTimeout(timer);
	}, [musicService, startSync, autoRecoverDatabase]);

	// CRUD functions for songs with error handling
	const refreshSongs = useCallback(async () => {
		setIsLoading(true);
		// Observers will handle state updates
	}, []);

	const getSongById = useCallback(async (id: string): Promise<Song | null> => {
		try {
			const song = await database.get<Song>("songs").find(id);
			return song;
		} catch (error) {
			console.error("Error getting song by id:", error);
			if (isDatabaseError(error)) {
				await autoRecoverDatabase(error);
			}
			return null;
		}
	}, [autoRecoverDatabase]);

	const updateSong = useCallback(async (id: string, updates: Partial<Song>) => {
		try {
			await database.write(async () => {
				const song = await database.get<Song>("songs").find(id);
				await song.update((record) => {
					Object.assign(record, updates);
				});
			});
		} catch (error) {
			console.error("Error updating song:", error);
			if (isDatabaseError(error)) {
				await autoRecoverDatabase(error);
			}
		}
	}, [autoRecoverDatabase]);

	const toggleFavorite = useCallback(async (id: string) => {
		try {
			const song = await database.get<Song>("songs").find(id);
			await song.toggleFavorite();
		} catch (error) {
			console.error("Error toggling favorite:", error);
			if (isDatabaseError(error)) {
				await autoRecoverDatabase(error);
			}
		}
	}, [autoRecoverDatabase]);

	const incrementPlayCount = useCallback(async (id: string) => {
		try {
			const song = await database.get<Song>("songs").find(id);
			await song.incrementPlayCount();
		} catch (error) {
			console.error("Error incrementing play count:", error);
			if (isDatabaseError(error)) {
				await autoRecoverDatabase(error);
			}
		}
	}, [autoRecoverDatabase]);

	// Search and filtering functions with error handling
	const searchSongs = useCallback(async (query: string): Promise<Song[]> => {
		try {
			const results = await database
				.get<Song>("songs")
				.query(
					Q.or(
						Q.where("title", Q.like(`%${query}%`))
						// Could expand this to search in artist and album
					)
				)
				.fetch();
			return results;
		} catch (error) {
			console.error("Error searching songs:", error);
			if (isDatabaseError(error)) {
				await autoRecoverDatabase(error);
			}
			return [];
		}
	}, [autoRecoverDatabase]);

	const getSongsByArtist = useCallback(
		async (artistId: string): Promise<Song[]> => {
			try {
				const results = await database
					.get<Song>("songs")
					.query(Q.where("artist_id", artistId))
					.fetch();
				return results;
			} catch (error) {
				console.error("Error getting songs by artist:", error);
				if (isDatabaseError(error)) {
					await autoRecoverDatabase(error);
				}
				return [];
			}
		},
		[autoRecoverDatabase]
	);

	const getSongsByAlbum = useCallback(
		async (albumId: string): Promise<Song[]> => {
			try {
				const results = await database
					.get<Song>("songs")
					.query(Q.where("album_id", albumId))
					.fetch();
				return results;
			} catch (error) {
				console.error("Error getting songs by album:", error);
				if (isDatabaseError(error)) {
					await autoRecoverDatabase(error);
				}
				return [];
			}
		},
		[autoRecoverDatabase]
	);

	const getFavoriteSongs = useCallback(async (): Promise<Song[]> => {
		try {
			const results = await database
				.get<Song>("songs")
				.query(Q.where("is_favorite", true))
				.fetch();
			return results;
		} catch (error) {
			console.error("Error getting favorite songs:", error);
			if (isDatabaseError(error)) {
				await autoRecoverDatabase(error);
			}
			return [];
		}
	}, [autoRecoverDatabase]);

	const getRecentlyPlayed = useCallback(async (): Promise<Song[]> => {
		try {
			const results = await database
				.get<Song>("songs")
				.query(
					Q.where("last_played_at", Q.notEq(null)),
					Q.sortBy("last_played_at", Q.desc),
					Q.take(50)
				)
				.fetch();
			return results;
		} catch (error) {
			console.error("Error getting recently played songs:", error);
			if (isDatabaseError(error)) {
				await autoRecoverDatabase(error);
			}
			return [];
		}
	}, [autoRecoverDatabase]);

	const clearDatabase = useCallback(async () => {
		try {
			await musicService.clearDatabase();
		} catch (error) {
			console.error("Error clearing database:", error);
		}
	}, [musicService]);

	const getLibraryStats = useCallback(async () => {
		try {
			return await musicService.getLibraryStats();
		} catch (error) {
			console.error("Error getting library stats:", error);
			if (isDatabaseError(error)) {
				await autoRecoverDatabase(error);
			}
			return null;
		}
	}, [musicService, autoRecoverDatabase]);

	const contextValue: MusicContextValue = {
		// State
		songs,
		artists,
		albums,
		isLoading,
		syncProgress,
		isSyncing,
		isRecovering,
		recoveryMessage,

		// CRUD operations
		refreshSongs,
		getSongById,
		updateSong,
		toggleFavorite,
		incrementPlayCount,

		// Search and filtering
		searchSongs,
		getSongsByArtist,
		getSongsByAlbum,
		getFavoriteSongs,
		getRecentlyPlayed,

		// Sync control
		startSync,
		clearDatabase,
		getLibraryStats,
	};

	return (
		<MusicContext.Provider value={contextValue}>
			{children}
		</MusicContext.Provider>
	);
};

export const useMusicLibrary = () => {
	const context = useContext(MusicContext);
	if (!context)
		throw new Error("useMusicLibrary must be inside of MusicProvider");
	return context;
};
