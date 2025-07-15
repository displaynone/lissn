import * as FileSystem from "expo-file-system";

export const saveCoverImage = async (base64: string, id: string) => {
	const dirUri = `${FileSystem.documentDirectory}covers`;
	const fileUri = `${dirUri}/${id}.jpg`;

  const dirInfo = await FileSystem.getInfoAsync(dirUri);
	if (!dirInfo.exists) {
		await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
	}

	await FileSystem.writeAsStringAsync(fileUri, base64, {
		encoding: FileSystem.EncodingType.Base64,
	});

	return fileUri;
};
