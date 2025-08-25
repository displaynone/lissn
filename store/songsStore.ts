import { database } from "@/database";
import { Album, Artist, Song } from "@/models";
import {
	MusicLibraryService,
	SyncProgress,
} from "@/services/MusicLibraryService";
import { Q } from "@nozbe/watermelondb";
import { create } from "zustand";

interface MusicStoreState {
	songs: Song[];
	favoriteSongs: Song[];
	artists: Artist[];
	albums: Album[];
	isLoading: boolean;
	isSyncing: boolean;
	isSynced: boolean;
	syncProgress: SyncProgress | null;
	isRecovering: boolean;
	recoveryMessage: string | null;
	playingSongId?: string;
	page: number;
	favoritePage: number;
	allSongsLoaded: boolean;
	allFavoriteSongsLoaded: boolean;
	search?: string;

	refreshSongs: (limit?: number) => Promise<void>;
	refreshFavoriteSongs: (limit?: number) => Promise<void>;
	getSongById: (id: string) => Promise<Song | null>;
	updateSong: (id: string, updates: Partial<Song>) => Promise<void>;
	updateArtist: (id: string, updates: Partial<Artist>) => Promise<void>;
	updateAlbum: (id: string, updates: Partial<Album>) => Promise<void>;
	createArtist: (artist: Partial<Artist>) => Promise<Artist>;
	createAlbum: (album: Partial<Album>) => Promise<Album>;
	toggleFavorite: (id: string) => Promise<void>;
	incrementPlayCount: (id: string) => Promise<void>;
	deleteSong: (id: string) => Promise<void>;
	deleteArtist: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;

	searchSongs: (query: string) => Promise<Song[]>;
	getSongsByArtist: (artistId: string) => Promise<Song[]>;
	getSongsByAlbum: (albumId: string) => Promise<Song[]>;
	getFavoriteSongs: () => Promise<Song[]>;
	getRecentlyPlayed: (limit?: number) => Promise<Song[]>;

	startSync: () => Promise<void>;
	clearDatabase: () => Promise<void>;
	getLibraryStats: () => Promise<any>;

	refreshArtists: (limit?: number) => Promise<void>;
	getArtistById: (id: string) => Promise<Artist | null>;
	getAlbumById: (id: string) => Promise<Album | null>;

	setPlayingSongId: (id?: string) => void;
	getNextSongById: (id?: string) => Promise<Song | null>;
	getPreviousSongById: (id?: string) => Promise<Song | null>;

	setSearch: (search?: string) => void;

	getSimilarArtists: (artist: Artist) => Promise<Artist[]>;
	mergeArtists: (
		targetArtistId: string,
		otherArtistsIds: string[]
	) => Promise<void>;
	getSimilarAlbums: (artist: Album) => Promise<Album[]>;
	mergeAlbums: (
		targetAlbumstId: string,
		otherAlbumsIds: string[]
	) => Promise<void>;

	refreshAlbums: (limit?: number) => Promise<void>;
}

const musicService = MusicLibraryService.getInstance();

const LIMIT = 20;
const DEFAULT_ORDER_COLUMN = "external_id";

export const useMusicStore = create<MusicStoreState>((set, get) => ({
	songs: [],
	favoriteSongs: [],
	artists: [],
	albums: [],
	isLoading: true,
	isSynced: false,
	isSyncing: false,
	syncProgress: null,
	isRecovering: false,
	recoveryMessage: null,
	playingSongId: undefined,
	page: 0,
	favoritePage: 0,
	allSongsLoaded: false,
	allFavoriteSongsLoaded: false,
	search: undefined,

	refreshSongs: async (limit: number = LIMIT) => {
		const { songs: loadedSongs, page, allSongsLoaded, search } = get();

		if (allSongsLoaded) {
			return;
		}

		const total = await database.get<Song>("songs").query().fetchCount();

		const conditions = [
			search?.trim()
				? Q.where("title", Q.like(`%${Q.sanitizeLikeString(search.trim())}%`))
				: undefined,
			Q.sortBy(DEFAULT_ORDER_COLUMN, Q.desc),
			Q.take(limit),
			Q.skip(limit * page),
		].filter(Boolean) as Q.Clause[];

		const songs = await database.get<Song>("songs").query(conditions).fetch();
		const newSongs = [...loadedSongs, ...songs];
		set({
			songs: newSongs,
			isLoading: false,
			page: page + 1,
			allSongsLoaded: newSongs.length >= total,
		});
	},

	refreshFavoriteSongs: async (limit: number = LIMIT) => {
		const {
			favoriteSongs: loadedFavoriteSongs,
			favoritePage,
			allFavoriteSongsLoaded,
		} = get();

		if (allFavoriteSongsLoaded) {
			return;
		}

		const total = await database
			.get<Song>("songs")
			.query(Q.where("is_favorite", true))
			.fetchCount();

		const songs = await database
			.get<Song>("songs")
			.query(
				Q.where("is_favorite", true),
				Q.sortBy(DEFAULT_ORDER_COLUMN, Q.desc),
				Q.take(limit),
				Q.skip(limit * favoritePage)
			)
			.fetch();
		const newSongs = [...loadedFavoriteSongs, ...songs];
		set({
			favoriteSongs: newSongs,
			isLoading: false,
			favoritePage: favoritePage + 1,
			allFavoriteSongsLoaded: newSongs.length >= total,
		});
	},

	getSongById: async (id) => {
		try {
			return await database.get<Song>("songs").find(id);
		} catch (e) {
			console.error("getSongById error", e);
			return null;
		}
	},

	updateSong: async (id, updates) => {
		await database.write(async () => {
			const song = await database.get<Song>("songs").find(id);
			const updatedSong = await song.update((record) => {
				Object.entries(updates).forEach(([key, value]) => {
					// @ts-expect-error dynamic assignment
					record[key] = value;
				});
			});
			set((state) => ({
				songs: state.songs.map((s) => (s.id === id ? updatedSong : s)),
			}));
		});
	},

	updateArtist: async (id, updates) => {
		await database.write(async () => {
			const artist = await database.get<Song>("artists").find(id);
			await artist.update((record) => {
				Object.entries(updates).forEach(([key, value]) => {
					// @ts-expect-error dynamic assignment
					record[key] = value;
				});
			});
		});
	},

	updateAlbum: async (id, updates) => {
		await database.write(async () => {
			const album = await database.get<Song>("albums").find(id);
			await album.update((record) => {
				Object.entries(updates).forEach(([key, value]) => {
					// @ts-expect-error dynamic assignment
					record[key] = value;
				});
			});
		});
	},

	createArtist: async (artist: Partial<Artist>) => {
		const res = await database.write(async () => {
			const writtenArtist = await database
				.get("artists")
				.create((newArtist) => {
					Object.assign(newArtist, artist);
				});
			return writtenArtist;
		});
		const { refreshArtists } = get();
		await refreshArtists(100_000);
		return res as Artist;
	},

	createAlbum: async (album: Partial<Album>) => {
		const res = await database.write(async () => {
			const writtenAlbum = await database
				.get("albums")
				.create((newAlbum) => {
					Object.assign(newAlbum, album);
				});
			return writtenAlbum;
		});
		const { refreshAlbums } = get();
		await refreshAlbums(100_000);
		return res as Album;
	},

	toggleFavorite: async (id) => {
		const song = await database.get<Song>("songs").find(id);
		const { favoriteSongs } = get();
		if (song.isFavorite) {
			set({ favoriteSongs: favoriteSongs.filter((song) => song.id !== id) });
		} else {
			set({ favoriteSongs: [...favoriteSongs, song] });
		}
		await song.toggleFavorite();
	},

	incrementPlayCount: async (id) => {
		const song = await database.get<Song>("songs").find(id);
		await song.incrementPlayCount();
	},

	deleteSong: async (id) => {
		await database.write(async () => {
			console.log("Deleting song", id);
			const song = await database.get<Song>("songs").find(id);
			await song.markAsDeleted();
			const { songs, favoriteSongs, playingSongId } = get();
			set({
				songs: songs.filter((s) => s.id !== id),
				favoriteSongs: favoriteSongs.filter((s) => s.id !== id),
			});
			if (playingSongId === id) {
				set({ playingSongId: undefined });
			}
		});
	},

	deleteArtist: async (id) => {
		await database.write(async () => {
			console.log("Deleting artist", id);
			const artist = await database.get<Artist>("artists").find(id);
			await artist.markAsDeleted();
			const { artists } = get();
			set({
				artists: artists.filter((a) => a.id !== id),
			});
		});
	},

	deleteAlbum: async (id) => {
		await database.write(async () => {
			console.log("Deleting album", id);
			const album = await database.get<Album>("albums").find(id);
			await album.markAsDeleted();
			const { albums } = get();
			set({
				albums: albums.filter((a) => a.id !== id),
			});
		});
	},

	searchSongs: async (query) => {
		return await database
			.get<Song>("songs")
			.query(Q.where("title", Q.like(`%${query}%`)))
			.fetch();
	},

	getSongsByArtist: async (artistId) => {
		return await database
			.get<Song>("songs")
			.query(Q.where("artist_id", artistId))
			.fetch();
	},

	getSongsByAlbum: async (albumId) => {
		return await database
			.get<Song>("songs")
			.query(Q.where("album_id", albumId))
			.fetch();
	},

	getFavoriteSongs: async () => {
		return await database
			.get<Song>("songs")
			.query(Q.where("is_favorite", true))
			.fetch();
	},

	getRecentlyPlayed: async (limit: number = 10) => {
		return await database
			.get<Song>("songs")
			.query(
				Q.where("last_played_at", Q.notEq(null)),
				Q.sortBy("last_played_at", Q.desc),
				Q.take(limit)
			)
			.fetch();
	},

	startSync: async () => {
		const { isSyncing } = get();
		if (isSyncing) return;
		set({ isSyncing: true });
		try {
			await musicService.syncLibrary((progress) => {
				set({ syncProgress: progress });
			});
		} catch (e) {
			console.error("Sync error", e);
		} finally {
			set({ isSyncing: false, syncProgress: null, isSynced: true });
		}
	},

	clearDatabase: async () => {
		await musicService.clearDatabase();
	},

	getLibraryStats: async () => {
		return await musicService.getLibraryStats();
	},

	refreshArtists: async (limit: number = 20) => {
		const artists = await database
			.get<Artist>("artists")
			.query(Q.sortBy("name", Q.asc), Q.take(limit))
			.fetch();
		set({ artists, isLoading: false });
	},

	getArtistById: async (id) => {
		try {
			if (!id) {
				return null;
			}
			const artist = await database.get<Artist>("artists").find(id);
			return artist;
		} catch (e) {
			console.error("getArtistById error", e);
			return null;
		}
	},

	getAlbumById: async (id) => {
		try {
			if (!id) {
				return null;
			}
			const album = await database.get<Album>("albums").find(id);
			return album;
		} catch (e) {
			console.error("getAlbumById error", e);
			return null;
		}
	},

	setPlayingSongId: (id) => {
		set({ playingSongId: id });
	},

	getNextSongById: async (id?: string) => {
		if (!id) {
			return null;
		}
		try {
			const currentSong = await database.get<Song>("songs").find(id);
			if (!currentSong) return null;

			const nextSongs = await database
				.get<Song>("songs")
				.query(
					Q.where(DEFAULT_ORDER_COLUMN, Q.lt(currentSong?.externalId || "")),
					Q.sortBy(DEFAULT_ORDER_COLUMN, Q.desc),
					Q.take(1)
				)
				.fetch();

			return nextSongs[0] || null;
		} catch (e) {
			console.error("getNextSongById error", e);
			return null;
		}
	},

	getPreviousSongById: async (id?: string) => {
		if (!id) {
			return null;
		}
		try {
			const currentSong = await database.get<Song>("songs").find(id);
			if (!currentSong) return null;

			const nextSongs = await database
				.get<Song>("songs")
				.query(
					Q.where(DEFAULT_ORDER_COLUMN, Q.gt(currentSong?.externalId || "")),
					Q.sortBy(DEFAULT_ORDER_COLUMN, Q.asc),
					Q.take(1)
				)
				.fetch();

			return nextSongs[0] || null;
		} catch (e) {
			console.error("getNextSongById error", e);
			return null;
		}
	},

	setSearch: (search?: string) => {
		set({ search, page: 0, allSongsLoaded: false, songs: [] });
		get().refreshSongs();
	},

	getSimilarArtists: async (artist: Artist) => {
		const artists = await database
			.get<Artist>("artists")
			.query(
				Q.where("name", Q.like(`%${Q.sanitizeLikeString(artist.name)}%`)),
				Q.where("id", Q.notEq(artist.id))
			)
			.fetch();
		return artists;
	},

	getSimilarAlbums: async (album: Album) => {
		const albums = await database
			.get<Album>("albums")
			.query(
				Q.where("title", Q.like(`%${Q.sanitizeLikeString(album.title)}%`)),
				Q.where("id", Q.notEq(album.id))
			)
			.fetch();
		return albums;
	},

	mergeArtists: async (targetArtistId: string, otherArtistsIds: string[]) => {
		await database.write(async () => {
			const songs = await database
				.get<Song>("songs")
				.query(Q.where("artist_id", Q.oneOf(otherArtistsIds)))
				.fetch();
			for (const song of songs) {
				await song.update((s) => {
					s.artistId = targetArtistId;
				});
			}
			const otherArtists = await database
				.get<Artist>("artists")
				.query(Q.where("id", Q.oneOf(otherArtistsIds)));
			for (const artist of otherArtists) {
				await artist.markAsDeleted();
			}
		});
	},

	mergeAlbums: async (targetAlbumstId: string, otherAlbumsIds: string[]) => {
		await database.write(async () => {
			const songs = await database
				.get<Song>("songs")
				.query(Q.where("album_id", Q.oneOf(otherAlbumsIds)))
				.fetch();
			for (const song of songs) {
				await song.update((s) => {
					s.albumId = targetAlbumstId;
				});
			}
			const otherAlbums = await database
				.get<Artist>("albums")
				.query(Q.where("id", Q.oneOf(otherAlbumsIds)));
			for (const album of otherAlbums) {
				await album.markAsDeleted();
			}
		});
	},

	refreshAlbums: async (limit: number = 20) => {
		const albums = await database
			.get<Album>("albums")
			.query(Q.sortBy("title", Q.asc), Q.take(limit))
			.fetch();
		set({ albums });
	},
}));

export const useGetSongs = () => useMusicStore((state) => state.songs);
export const useGetFavoriteSongs = () =>
	useMusicStore((state) => state.favoriteSongs);
export const useGetSongById = () => useMusicStore((state) => state.getSongById);
export const useGetArtists = () => useMusicStore((state) => state.artists);
export const useGetArtistById = () =>
	useMusicStore((state) => state.getArtistById);
export const useGetAlbums = () => useMusicStore((state) => state.albums);
export const useAreSongsLoading = () =>
	useMusicStore((state) => state.isLoading);
export const useIsSyncing = () => useMusicStore((state) => state.isSyncing);
export const useSyncProgress = () =>
	useMusicStore((state) => state.syncProgress);
export const useIsRecovering = () =>
	useMusicStore((state) => state.isRecovering);
export const useRecoveryMessage = () =>
	useMusicStore((state) => state.recoveryMessage);
export const useIsSynced = () => useMusicStore((state) => state.isSynced);
export const useStartSync = () => useMusicStore((state) => state.startSync);
export const useRefreshSongs = () =>
	useMusicStore((state) => state.refreshSongs);
export const useGetPlayingSongId = () =>
	useMusicStore((state) => state.playingSongId);
export const useGetSetPlayingSongId = () =>
	useMusicStore((state) => state.setPlayingSongId);
export const useGetToggleFavorite = () =>
	useMusicStore((state) => state.toggleFavorite);
export const useRefreshFavoriteSongs = () =>
	useMusicStore((state) => state.refreshFavoriteSongs);
export const useRefreshArtists = () =>
	useMusicStore((state) => state.refreshArtists);
export const useRefreshAlbums = () =>
	useMusicStore((state) => state.refreshAlbums);
export const useGetSearch = () => useMusicStore((state) => state.search);
export const useGetSetSearch = () => useMusicStore((state) => state.setSearch);
export const useGetGetRecentlyPlayed = () =>
	useMusicStore((state) => state.getRecentlyPlayed);
export const useGetGetSongsByArtist = () =>
	useMusicStore((state) => state.getSongsByArtist);
export const useGetUpdateArtist = () =>
	useMusicStore((state) => state.updateArtist);
export const useGetUpdateAlbum = () =>
	useMusicStore((state) => state.updateAlbum);
export const useGetUpdateSong = () =>
	useMusicStore((state) => state.updateSong);
export const useGetSimilarArtists = () =>
	useMusicStore((state) => state.getSimilarArtists);
export const useGetSimilarAlbums = () =>
	useMusicStore((state) => state.getSimilarAlbums);
export const useGetMergeArtists = () =>
	useMusicStore((state) => state.mergeArtists);
export const useGetDeleteSong = () =>
	useMusicStore((state) => state.deleteSong);
export const useGetDeleteArtist = () =>
	useMusicStore((state) => state.deleteArtist);
export const useGetDeleteAlbum = () =>
	useMusicStore((state) => state.deleteAlbum);
export const useGetCreateArtist = () =>
	useMusicStore((state) => state.createArtist);
export const useGetCreateAlbum = () =>
	useMusicStore((state) => state.createAlbum);
export const useGetAlbumById = () =>
	useMusicStore((state) => state.getAlbumById);
export const useGetGetSongsByAlbum = () =>
	useMusicStore((state) => state.getSongsByAlbum);
export const useGetMergeAlbums = () =>
	useMusicStore((state) => state.mergeAlbums);
