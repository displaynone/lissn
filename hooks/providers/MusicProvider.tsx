// providers/SongsProvider.tsx
import { database } from "@/database";
import { Song } from "@/models/Song";
import { initMusicLibrary } from "@/services/initMusicLibrary";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Observable } from "rxjs";

type SongsContextValue = {
	songs: Song[];
	isLoading: boolean;
};

const MusicContext = createContext<SongsContextValue | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [songs, setSongs] = useState<Song[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		initMusicLibrary();
	}, []);

	useEffect(() => {
		const collection = database.get<Song>("songs");
		const observable: Observable<Song[]> = collection.query().observe();

		const subscription = observable.subscribe((results) => {
			setSongs(results);
			setIsLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	return (
		<MusicContext.Provider value={{ songs, isLoading }}>
			{children}
		</MusicContext.Provider>
	);
};

export const useMusicLibrary = () => {
	const context = useContext(MusicContext);
	if (!context)
		throw new Error("useMusicLibrary must be inside of MusicProvider");
	return context;
};
