import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

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

const adapter = new SQLiteAdapter({
	schema: mySchema,
	migrations,
	dbName: "lissn",
	jsi: false,
	onSetUpError: (error) => {
		console.error("❌ Error initializing WatermelonDB:", error);
	},
});

export const database = new Database({
	adapter,
	modelClasses: [Artist, Album, Genre, Song, Playlist, PlaylistSong, Settings],
});

const setup = async () => {
	await seedIfEmpty(database);
};

setup();
