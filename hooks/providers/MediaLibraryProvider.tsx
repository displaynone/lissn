// providers/AudioLibraryProvider.tsx
import * as MediaLibrary from "expo-media-library";
import React, { createContext, useCallback, useContext, useState } from "react";

type Audio = MediaLibrary.Asset;
type AudioLibraryContextType = {
	loading: boolean;
	songs: Audio[] | null;
	getSongs: () => Promise<void>;
};

const AudioLibraryContext = createContext<AudioLibraryContextType | null>(null);

export const AudioLibraryProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [loading, setLoading] = useState(false);
	const [songs, setSongs] = useState<Audio[] | null>(null);
	const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

	const getSongs = useCallback(async () => {
		if (permissionResponse?.status !== "granted") {
			await requestPermission();
		}

		setLoading(true);
		const assets = await MediaLibrary.getAssetsAsync({
			mediaType: MediaLibrary.MediaType.audio,
			first: 1000,
			sortBy: [MediaLibrary.SortBy.creationTime],
		});

		setSongs(assets.assets);
    setLoading(false);
	}, [permissionResponse, requestPermission]);

	return (
		<AudioLibraryContext.Provider value={{ loading, songs, getSongs }}>
			{children}
		</AudioLibraryContext.Provider>
	);
};

export const useAudioLibrary = () => {
	const context = useContext(AudioLibraryContext);
	if (!context)
		throw new Error(
			"useAudioLibrary must be used inside of AudioLibraryProvider"
		);
	return context;
};
