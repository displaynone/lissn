import "@/setup/buffer-polyfill";
import { Buffer } from "buffer";
import * as MediaLibrary from "expo-media-library";
import { parseBlob } from "music-metadata-browser";

export async function getID3TagsFromSong(asset: MediaLibrary.Asset) {
	try {
		const response = await fetch(asset.uri);
		const blob = await response.blob();

		const metadata = await parseBlob(blob);

		const { title, artist, album, picture } = metadata.common;

		let imageUri: string | null = null;
		if (picture?.[0]) {
			const mime = picture[0].format;
			const base64 = Buffer.from(picture[0].data).toString("base64");
			imageUri = `data:${mime};base64,${base64}`;
		}

		return {
			title,
			artist,
			album,
			imageUri,
		};
	} catch (err) {
		console.error("Error getting ID3 tags:", err);
		return null;
	}
}
