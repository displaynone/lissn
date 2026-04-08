import { Playlist } from "@/models";
import { PLAYLIST_PLAYING_NOW_NAME } from "@/models/Playlist";
import { Database } from "@nozbe/watermelondb";

export const seedIfEmpty = async (database: Database) => {
	const playlistCollection = database.get<Playlist>("playlists");
	const count = await playlistCollection.query().fetchCount();

	if (count === 0) {
		await database.write(async () => {
			await playlistCollection.create((playlist) => {
				playlist.name = PLAYLIST_PLAYING_NOW_NAME;
				playlist.description = "Playing Now";
				playlist.isSystem = true;
			});
		});
	// } else {
	// 	await database.write(async () => {
	// 		await playlistCollection
	// 			.query()
	// 			.fetch()
	// 			.then((playlists) => {
	// 				for (const item of playlists) {
	// 					item.destroyPermanently();
	// 				}
	// 			});
	// 	});
	}
};
