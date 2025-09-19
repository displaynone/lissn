import { database } from "@/database";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export async function exportDatabaseJSON() {
	const songs = await database.get("songs").query().fetch();
	const artists = await database.get("artists").query().fetch();
	const albums = await database.get("albums").query().fetch();
	const playlists = await database.get("playlists").query().fetch();
	const playlistSongs = await database.get("playlist_songs").query().fetch();

	const payload = {
		version: 1,
		exportedAt: new Date().toISOString(),
		tables: {
			songs: songs.map((m: any) => m._raw),
			artists: artists.map((m: any) => m._raw),
			albums: albums.map((m: any) => m._raw),
			playlists: playlists.map((m: any) => m._raw),
			playlistSongs: playlistSongs.map((m: any) => m._raw),
		},
	};

	const json = JSON.stringify(payload);
	const fileUri = `${FileSystem.cacheDirectory}db-export-${Date.now()}.json`;
	await FileSystem.writeAsStringAsync(fileUri, json, {
		encoding: FileSystem.EncodingType.UTF8,
	});

	if (await Sharing.isAvailableAsync()) {
		await Sharing.shareAsync(fileUri, { mimeType: "application/json" });
	} else {
		return fileUri;
	}
}
