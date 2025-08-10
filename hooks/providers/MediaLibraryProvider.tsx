import MusicLibrary, { Audio } from "@/lib/ExpoMusicLibrary";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Text, View } from "tamagui";

type AudioLibraryContextType = {
	loading: boolean;
	songs: Audio[] | null;
	albums: any[] | null;
	artists: any[] | null;
	genres: any[] | null;
	folders: any[] | null;
};

const AudioLibraryContext = createContext<AudioLibraryContextType | null>(null);

export const AudioLibraryProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {

	const [loading, setLoading] = useState(false);
	const [songs, setSongs] = useState<Audio[] | null>(null);
	const [albums, setAlbums] = useState<any[] | null>(null);
	const [artists, setArtists] = useState<any[] | null>(null);
	const [genres, setGenres] = useState<any[] | null>(null);
	const [folders, setFolders] = useState<any[] | null>(null);
	const [hasPermission, setHasPermission] = useState(false);

	useEffect(() => {
		loadMusicData();
	}, []);

	const loadMusicData = async () => {
		setLoading(true);
		try {
			// Check existing permissions
			const { status } = await MusicLibrary.getPermissionsAsync();

			if (status !== "granted") {
				// Request permissions
				const { status: newStatus } =
					await MusicLibrary.requestPermissionsAsync();
				if (newStatus !== "granted") {
					console.log(
						"Permission Required",
						"Please grant music library access to continue."
					);
					return;
				}
			}

			setHasPermission(true);

			// Load music files
			const assets = await MusicLibrary.getAssetsAsync({
				first: 2000,
				// sortBy: ["creationTime DESC"],
			});
			setSongs(assets);

			const albumsData = await MusicLibrary.getAlbumsAsync();

			setAlbums(albumsData);

			const artistsData = await MusicLibrary.getArtistsAsync();
			setArtists(artistsData);

			const genresData = await MusicLibrary.getGenresAsync();
			setGenres(genresData);

			const foldersData = await MusicLibrary.getFoldersAsync();
			setFolders(foldersData);

			setLoading(false);
		} catch (error) {
			console.error("Error loading music data:", error);
			setLoading(false);
			setHasPermission(false);
		}
	};

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Loading music library...</Text>
			</View>
		);
	}

	if (!hasPermission) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Requesting music library permissions...</Text>
			</View>
		);
	}

	return (
		<AudioLibraryContext.Provider value={{
			loading,
			songs,
			albums,
			artists,
			genres,
			folders
		}}>
			{children}
		</AudioLibraryContext.Provider>
	);
};

export const useAudioLibrary = (): AudioLibraryContextType => {
	const context = useContext(AudioLibraryContext);
	if (!context) {
		throw new Error("useAudioLibrary must be used within an AudioLibraryProvider");
	}
	return context;
};
