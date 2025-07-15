import * as MediaLibrary from "expo-media-library";

export const getSongsFromMediaLibrary = async () => {
	const { status } = await MediaLibrary.requestPermissionsAsync();
	if (status !== "granted") throw new Error("No hay permisos");

	const assets = await MediaLibrary.getAssetsAsync({
		mediaType: MediaLibrary.MediaType.audio,
		first: 1000,
	});

	return assets.assets;
};
