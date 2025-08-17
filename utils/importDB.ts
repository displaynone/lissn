// utils/importDbJson.ts
import { database } from "@/database";
import { Album, Artist, Song } from "@/models";
import { Q } from "@nozbe/watermelondb";
import * as FileSystem from "expo-file-system";

type ImportPayloadV1 = {
	version: 1;
	tables: {
		artists: {
			external_id?: string;
			artwork_uri?: string;
			name?: string;
		}[];
		albums: {
			external_id?: string;
			title?: string;
			artist_id?: string;
		}[];
		songs: {
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
	};
};

type ImportMode = "merge" | "replace";

export async function importDatabaseJSON(
	fileUri: string,
	mode: ImportMode = "merge"
) {
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

	await database.write(async () => {
		if (mode === "replace") {
			const [allSongs, allAlbums, allArtists] = await Promise.all([
				songsCol.query().fetch(),
				albumsCol.query().fetch(),
				artistsCol.query().fetch(),
			]);
			await database.batch(
				...allSongs.map((m) => m.prepareDestroyPermanently()),
				...allAlbums.map((m) => m.prepareDestroyPermanently()),
				...allArtists.map((m) => m.prepareDestroyPermanently())
			);
		}

		const artistIdByExternal: Record<string, string> = {};

		for (const a of payload.tables.artists ?? []) {
			const externalId = a.external_id ?? "";
			const name = a.name ?? "";

			if (!externalId && !name) continue;

			let existing: Artist | null = null;
			if (externalId) {
				const found = await artistsCol
					.query(Q.where("external_id", externalId))
					.fetch();
				existing = found[0] ?? null;
			} else {
				const found = await artistsCol.query(Q.where("name", name)).fetch();
				existing = found[0] ?? null;
			}

			if (existing) {
				await existing.update((rec) => {
					(rec as any).name = name || (rec as any).name;
					if (externalId) (rec as any).externalId = externalId;
				});
				artistIdByExternal[existing.externalId || externalId] = existing.id;
			} else {
				const created = await artistsCol.create((rec) => {
					(rec as any).name = name;
					if (externalId) (rec as any).externalId = externalId;
				});
				if (externalId) artistIdByExternal[externalId] = created.id;
			}
		}

		const albumIdByExternal: Record<string, string> = {};

		for (const al of payload.tables.albums ?? []) {
			const externalId = al.external_id ?? "";
			const title = al.title ?? "";
			let artistId: string | undefined = undefined;

			let existing: Album | null = null;
			if (externalId) {
				const found = await albumsCol
					.query(Q.where("external_id", externalId))
					.fetch();
				existing = found[0] ?? null;
			} else if (title) {
				const found = await albumsCol.query(Q.where("title", title)).fetch();
				existing = found[0] ?? null;
			}

			if (existing) {
				await existing.update((rec) => {
					if (title) (rec as any).title = title;
					if (artistId) (rec as any).artistId = artistId;
					if (externalId) (rec as any).externalId = externalId;
				});
				if (externalId) albumIdByExternal[externalId] = existing.id;
			} else {
				const created = await albumsCol.create((rec) => {
					if (title) (rec as any).title = title;
					if (artistId) (rec as any).artistId = artistId;
					if (externalId) (rec as any).externalId = externalId;
				});
				if (externalId) albumIdByExternal[externalId] = created.id;
			}
		}

		for (const s of payload.tables.songs ?? []) {
			const externalId = s.external_id ?? "";
			const title = s.title ?? "";

			let artistId: string | undefined = undefined;
			let albumId: string | undefined = undefined;

			if (s.artist_id) artistId = s.artist_id;
			if (s.album_id) albumId = s.album_id;

			let existing: Song | null = null;
			if (externalId) {
				const found = await songsCol
					.query(Q.where("external_id", externalId))
					.fetch();
				existing = found[0] ?? null;
			} else if (title && artistId) {
				const found = await songsCol
					.query(Q.where("title", title), Q.where("artist_id", artistId))
					.fetch();
				existing = found[0] ?? null;
			}

			if (existing) {
				await existing.update((rec) => {
					if (title) (rec as any).title = title;
					if (artistId) (rec as any).artistId = artistId;
					if (albumId) (rec as any).albumId = albumId;
					if (s.source_uri) (rec as any).sourceUri = s.source_uri;
					if (typeof s.cover_path !== "undefined")
						(rec as any).coverPath = s.cover_path;
					if (typeof s.duration !== "undefined")
						(rec as any).duration = s.duration ?? null;
					if (typeof s.track_number !== "undefined")
						(rec as any).trackNumber = s.track_number ?? null;
					if (typeof s.file_size !== "undefined")
						(rec as any).fileSize = s.file_size ?? null;
					if (typeof s.is_favorite !== "undefined")
						(rec as any).isFavorite = !!s.is_favorite;
					if (typeof s.play_count !== "undefined")
						(rec as any).playCount = s.play_count ?? 0;
					if (typeof s.last_played_at !== "undefined")
						(rec as any).lastPlayedAt = s.last_played_at ?? null;
					if (externalId) (rec as any).externalId = externalId;
				});
			} else {
				await songsCol.create((rec) => {
					(rec as any).title = title;
					if (artistId) (rec as any).artistId = artistId;
					if (albumId) (rec as any).albumId = albumId;
					if (s.source_uri) (rec as any).sourceUri = s.source_uri;
					if (typeof s.cover_path !== "undefined")
						(rec as any).coverPath = s.cover_path;
					if (typeof s.duration !== "undefined")
						(rec as any).duration = s.duration ?? null;
					if (typeof s.track_number !== "undefined")
						(rec as any).trackNumber = s.track_number ?? null;
					if (typeof s.file_size !== "undefined")
						(rec as any).fileSize = s.file_size ?? null;
					if (typeof s.is_favorite !== "undefined")
						(rec as any).isFavorite = !!s.is_favorite;
					if (typeof s.play_count !== "undefined")
						(rec as any).playCount = s.play_count ?? 0;
					if (typeof s.last_played_at !== "undefined")
						(rec as any).lastPlayedAt = s.last_played_at ?? null;
					if (externalId) (rec as any).externalId = externalId;
				});
			}
		}
	});
}
