// utils/importDbJson.ts
import { database } from "@/database";
import { Album, Artist, Playlist, PlaylistSong, Song } from "@/models";
import { store } from "@/store/songsStore";
import { Q } from "@nozbe/watermelondb";
import * as FileSystem from "expo-file-system";
import { chunk } from "./chunk";

const BATCH_CHUNK = 50;

type ImportPayloadV1 = {
	version: 1;
	tables: {
		artists: {
			id?: string;
			external_id?: string;
			artwork_uri?: string;
			name?: string;
		}[];
		albums: {
			id?: string;
			external_id?: string;
			title?: string;
			artist_id?: string;
			artwork_uri?: string;
		}[];
		songs: {
			id?: string;
			external_id?: string;
			title: string;
			artist_id?: string;
			album_id?: string;
			source_uri?: string;
			cover_path?: string | null;
			duration?: number | null;
			track_number?: number | null;
			file_size?: number | null;
			is_favorite?: boolean;
			play_count?: number;
			last_played_at?: number | null;
		}[];
		playlists: {
			id: string;
			name: string;
			description: string;
			cover_uri?: string | null;
			is_system: boolean;
		}[];
		playlistSongs: {
			id: string;
			playlist_id: string;
			song_id: string;
			position: number;
		}[];
	};
};

type ImportMode = "merge" | "replace";

export async function importDatabaseJSON(
	fileUri: string,
	mode: ImportMode = "merge"
) {
	try {
		const raw = await FileSystem.readAsStringAsync(fileUri, {
			encoding: FileSystem.EncodingType.UTF8,
		});
		const payload = JSON.parse(raw) as ImportPayloadV1;

		if (!payload || payload.version !== 1) {
			throw new Error("Backup format not sopported or invalid version.");
		}

		const artistsCol = database.get<Artist>("artists");
		const albumsCol = database.get<Album>("albums");
		const songsCol = database.get<Song>("songs");
		const playlistsCol = database.get<Playlist>("playlists");
		const playlistSongsCol = database.get<PlaylistSong>("playlist_songs");

		await database.write(async () => {
			if (mode === "replace") {
				const [
					allSongs,
					allAlbums,
					allArtists,
					allPlaylists,
					allPlaylistSongs,
				] = await Promise.all([
					songsCol.query().fetch(),
					albumsCol.query().fetch(),
					artistsCol.query().fetch(),
					playlistsCol.query().fetch(),
					playlistSongsCol.query().fetch(),
				]);
				const ops = [
					...allPlaylistSongs.map((m) => m.prepareDestroyPermanently()),
					...allPlaylists.map((m) => m.prepareDestroyPermanently()),
					...allSongs.map((m) => m.prepareDestroyPermanently()),
					...allAlbums.map((m) => m.prepareDestroyPermanently()),
					...allArtists.map((m) => m.prepareDestroyPermanently()),
				];

				for (const part of chunk(ops, BATCH_CHUNK)) {
					await database.batch(part);
				}

				console.log("Deleted:", {
					songs: await songsCol.query().fetchCount(),
					albums: await albumsCol.query().fetchCount(),
					artists: await artistsCol.query().fetchCount(),
					playlists: await playlistsCol.query().fetchCount(),
					playlistSongs: await playlistSongsCol.query().fetchCount(),
				});
			}

			const artistsById: Record<string, Artist> = {};

			for (const a of payload.tables.artists ?? []) {
				const id = a.id ?? "";
				const name = a.name ?? "";
				const artworkUri = a.artwork_uri ?? "";

				if (!id && !name) continue;

				let existing: Artist | null = null;
				if (id) {
					const found = await artistsCol.query(Q.where("id", id)).fetch();
					existing = found[0] ?? null;
				} else {
					const found = await artistsCol.query(Q.where("name", name)).fetch();
					existing = found[0] ?? null;
				}

				if (existing) {
					await existing.update((rec) => {
						rec.name = name || rec.name;
						rec.artworkUri = artworkUri || rec.artworkUri;
					});
					artistsById[id] = existing;
				} else {
					const created = await artistsCol.create((rec) => {
						rec.name = name;
						rec.artworkUri = artworkUri;
					});
					artistsById[id] = created;
				}
			}
			console.log(Object.values(artistsById).map((a) => a.name));

			const albumsById: Record<string, Album> = {};

			for (const al of payload.tables.albums ?? []) {
				const id = al.id ?? "";
				const title = al.title ?? "";
				const artistId = al.artist_id ?? "";
				const artworkUri = al.artwork_uri ?? "";

				let existing: Album | null = null;
				if (id) {
					const found = await albumsCol.query(Q.where("id", id)).fetch();
					existing = found[0] ?? null;
				} else if (title) {
					const found = await albumsCol.query(Q.where("title", title)).fetch();
					existing = found[0] ?? null;
				}

				if (existing) {
					await existing.update((rec) => {
						if (title) rec.title = title;
						if (artistId) rec.artistId = artistsById[artistId]?.id;
						if (artworkUri) rec.artworkUri = artworkUri;
					});
					albumsById[id] = existing;
				} else {
					const created = await albumsCol.create((rec) => {
						if (title) rec.title = title;
						if (artistId) rec.artistId = artistsById[artistId]?.id;
						if (artworkUri) rec.artworkUri = artworkUri;
						console.log(rec.title, rec.artistId, rec.artworkUri);
					});
					albumsById[id] = created;
				}
			}

			const songsById: Record<string, Song> = {};

			for (const s of payload.tables.songs ?? []) {
				const id = s.id ?? "";
				const title = s.title ?? "";
				const artistId = s.artist_id ?? "";
				const albumId = s.album_id ?? "";
				const coverPath = s.cover_path ?? "";
				const sourceUri = s.source_uri ?? "";
				const duration = s.duration ?? 0;
				const isFavorite = s.is_favorite || false;

				let existing: Song | null = null;
				if (sourceUri) {
					const found = await songsCol
						.query(Q.where("source_uri", sourceUri))
						.fetch();
					existing = found[0] ?? null;
				} else if (title && artistId) {
					const found = await songsCol
						.query(
							Q.where("title", title),
							Q.where("artist_id", artistsById[artistId].id)
						)
						.fetch();
					existing = found[0] ?? null;
				}

				if (existing) {
					await existing.update((rec) => {
						if (title) rec.title = title;
						if (artistId) rec.artistId = artistsById[artistId].id;
						if (albumId) rec.albumId = albumsById[albumId].id;
						if (s.source_uri) rec.sourceUri = s.source_uri;
						if (typeof s.cover_path !== "undefined")
							rec.coverPath = coverPath || s.cover_path || undefined;
						if (typeof s.source_uri !== "undefined")
							rec.sourceUri = sourceUri || s.source_uri;
						if (typeof s.duration !== "undefined")
							rec.duration = duration || s.duration || 0;
						if (typeof s.is_favorite !== "undefined")
							rec.isFavorite = isFavorite || !!s.is_favorite;
					});
					songsById[id] = existing;
				} else {
					const created = await songsCol.create((rec) => {
						if (title) rec.title = title;
						if (artistId) rec.artistId = artistsById[artistId].id;
						if (albumId) rec.albumId = albumsById[albumId].id;
						if (s.source_uri) rec.sourceUri = s.source_uri;
						if (typeof s.cover_path !== "undefined")
							rec.coverPath = coverPath || s.cover_path || undefined;
						if (typeof s.source_uri !== "undefined")
							rec.sourceUri = sourceUri || s.source_uri;
						if (typeof s.duration !== "undefined")
							rec.duration = duration || s.duration || 0;
						if (typeof s.is_favorite !== "undefined")
							rec.isFavorite = isFavorite || !!s.is_favorite;
						if (rec.sourceUri.includes("Lee")) {
							console.log(rec.title);
							console.log(rec.sourceUri);
							console.log(artistsById[artistId].name);
							console.log(albumsById[albumId].title);
						}
					});
					songsById[id] = created;
				}
			}

			const playlistsById: Record<string, Playlist> = {};

			for (const a of payload.tables.playlists ?? []) {
				const id = a.id ?? "";
				const name = a.name ?? "";
				const description = a.description ?? "";
				const coverUri = a.cover_uri ?? "";
				const isSystem = a.is_system ?? false;

				if (!id && !name) continue;

				let existing: Playlist | null = null;
				if (id) {
					const found = await playlistsCol.query(Q.where("id", id)).fetch();
					existing = found[0] ?? null;
				} else {
					const found = await playlistsCol.query(Q.where("name", name)).fetch();
					existing = found[0] ?? null;
				}

				if (existing) {
					await existing.update((rec) => {
						rec.name = name || rec.name;
						rec.description = description || rec.description;
						rec.coverUri = coverUri || rec.coverUri;
						rec.isSystem = isSystem || rec.isSystem;
					});
					playlistsById[id] = existing;
				} else {
					const created = await playlistsCol.create((rec) => {
						rec.name = name || rec.name;
						rec.description = description || rec.description;
						rec.coverUri = coverUri || rec.coverUri;
						rec.isSystem = isSystem || rec.isSystem;
					});
					playlistsById[id] = created;
				}
			}

			for (const a of payload.tables.playlistSongs ?? []) {
				const id = a.id ?? "";
				const playlistId = a.playlist_id ?? "";
				const position = a.position ?? 0;
				const songId = a.song_id ?? false;

				if (!id) continue;

				let existing: PlaylistSong | null = null;
				if (id) {
					const found = await playlistSongsCol.query(Q.where("id", id)).fetch();
					existing = found[0] ?? null;
				}

				if (existing) {
					await existing.update((rec) => {
						rec.playlistId = playlistsById[playlistId]?.id || rec.playlistId;
						rec.songId = songsById[songId]?.id || rec.songId;
						rec.position = position || rec.position;
					});
				} else {
					await playlistSongsCol.create((rec) => {
						rec.playlistId = playlistsById[playlistId]?.id || rec.playlistId;
						rec.songId = songsById[songId]?.id || rec.songId;
						rec.position = position || rec.position;
					});
				}
			}
		});
		console.log("Refreshing data");
		await store.getState().refreshAll();
	} catch (e) {
		console.log(e);
	}
}
