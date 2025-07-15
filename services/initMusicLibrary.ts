import { getSongsFromMediaLibrary } from "@/utils/getSongsFromMediaLibrary";

let alreadyInitialized = false;

export const initMusicLibrary = async () => {
  console.log("📀 Inicializando biblioteca de música...", alreadyInitialized);
	// if (alreadyInitialized) return;
	alreadyInitialized = true;

  console.log(1);
	const songs = await getSongsFromMediaLibrary();
  console.log(2);
	// await database.unsafeResetDatabase();
  console.log(3);

	for (const asset of songs) {
		console.log("📀 asset:", asset);
		// try {
		// 	const existing = await database.get<Song>("songs").query().fetch();
		// 	const exists = existing.some((s) => s.sourceUri === asset.uri);
		// 	// if (exists) continue;

		// 	const tags = await getID3TagsFromSong(asset);
		// 	console.log("📀 song:", tags?.title);

		// 	await database.write(async () => {
		// 		const coverPath = await saveCoverImage(tags?.imageUri || "", asset.id);
		// 		await database.get<Song>("songs").create((song) => {
		// 			song.title = tags?.title || asset.filename;
		// 			song.artist = tags?.artist || "Unknown";
		// 			song.album = tags?.album || "Unknown";
		// 			song.coverPath = coverPath;
		// 			song.sourceUri = asset.uri;
		// 		});
		// 	});
		// } catch (e) {
		// 	console.warn("Error guardando canción:", asset.filename, e);
		// }
	}

	console.log("📀 Biblioteca de música inicializada.");
};
