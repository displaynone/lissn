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
	allSongsLoaded: boolean;

	refreshSongs: (limit?: number) => Promise<void>;
	getSongById: (id: string) => Promise<Song | null>;
	updateSong: (id: string, updates: Partial<Song>) => Promise<void>;
	toggleFavorite: (id: string) => Promise<void>;
	incrementPlayCount: (id: string) => Promise<void>;

	searchSongs: (query: string) => Promise<Song[]>;
	getSongsByArtist: (artistId: string) => Promise<Song[]>;
	getSongsByAlbum: (albumId: string) => Promise<Song[]>;
	getFavoriteSongs: () => Promise<Song[]>;
	getRecentlyPlayed: () => Promise<Song[]>;

	startSync: () => Promise<void>;
	clearDatabase: () => Promise<void>;
	getLibraryStats: () => Promise<any>;

	refreshArtists: (limit?: number) => Promise<void>;
	getArtistById: (id: string) => Promise<Artist | null>;

	setPlayingSongId: (id?: string) => void;
	getNextSongById: (id?: string) => Promise<Song | null>;
	getPreviousSongById: (id?: string) => Promise<Song | null>;
}

const musicService = MusicLibraryService.getInstance();

const LIMIT = 20;
const DEFAULT_ORDER_COLUMN = "external_id";

export const useMusicStore = create<MusicStoreState>((set, get) => ({
	songs: [],
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
	allSongsLoaded: false,

	refreshSongs: async (limit: number = LIMIT) => {
		const { songs: loadedSongs, page, allSongsLoaded } = get();

		if (allSongsLoaded) {
			return;
		}

		const total = await database.get<Song>("songs").query().fetchCount();

		const songs = await database
			.get<Song>("songs")
			.query(
				Q.sortBy(DEFAULT_ORDER_COLUMN, Q.desc),
				Q.take(limit),
				Q.skip(limit * page)
			)
			.fetch();
		const newSongs = [...loadedSongs, ...songs];
		set({
			songs: newSongs,
			isLoading: false,
			page: page + 1,
			allSongsLoaded: newSongs.length >= total,
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
			await song.update((record) => Object.assign(record, updates));
		});
	},

	toggleFavorite: async (id) => {
		const song = await database.get<Song>("songs").find(id);
		await song.toggleFavorite();
	},

	incrementPlayCount: async (id) => {
		const song = await database.get<Song>("songs").find(id);
		await song.incrementPlayCount();
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

	getRecentlyPlayed: async () => {
		return await database
			.get<Song>("songs")
			.query(
				Q.where("last_played_at", Q.notEq(null)),
				Q.sortBy("last_played_at", Q.desc),
				Q.take(50)
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
			.query(Q.sortBy(DEFAULT_ORDER_COLUMN, Q.desc), Q.take(limit))
			.fetch();
		set({ artists, isLoading: false });
	},

	getArtistById: async (id) => {
		try {
			const artist = await database.get<Artist>("artists").find(id);
			return artist;
		} catch (e) {
			console.error("getArtistById error", e);
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
					Q.where(DEFAULT_ORDER_COLUMN, Q.lt(currentSong?.externalId || '')),
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
					Q.where(DEFAULT_ORDER_COLUMN, Q.gt(currentSong?.externalId || '')),
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
}));

export const useGetSongs = () => useMusicStore((state) => state.songs);
export const useGetSongById = (songId: string) =>
	useMusicStore((state) => state.getSongById(songId));
export const useGetArtists = () => useMusicStore((state) => state.artists);
export const useGetArtistById = (artistId: string) =>
	useMusicStore((state) => state.getArtistById(artistId));
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
