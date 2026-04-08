import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import {
	Database,
	type Database as WatermelonDatabase,
} from "@nozbe/watermelondb";
import { Platform } from "react-native";

import {
	Album,
	Artist,
	Genre,
	Playlist,
	PlaylistSong,
	Settings,
	Song,
} from "@/models";
import migrations from "@/models/migrations";
import { mySchema } from "./schema";
import { seedIfEmpty } from "./seed/seedPlaylists";

const isNativeRuntime = Platform.OS === "android" || Platform.OS === "ios";

function createUnavailableDatabase(): WatermelonDatabase {
	return new Proxy(
		{},
		{
			get(_target, prop) {
				throw new Error(
					`WatermelonDB is unavailable during ${Platform.OS} static/server rendering. Tried to access "${String(prop)}".`
				);
			},
		}
	) as WatermelonDatabase;
}

function createNativeDatabase(): WatermelonDatabase {
	const adapter = new SQLiteAdapter({
		schema: mySchema,
		migrations,
		dbName: "lissn",
		jsi: false,
		onSetUpError: (error) => {
			console.error("Error initializing WatermelonDB:", error);
		},
	});

	const database = new Database({
		adapter,
		modelClasses: [Artist, Album, Genre, Song, Playlist, PlaylistSong, Settings],
	});

	seedIfEmpty(database).catch((error) => {
		console.error("Error seeding WatermelonDB:", error);
	});

	return database;
}

export const database = isNativeRuntime
	? createNativeDatabase()
	: createUnavailableDatabase();
