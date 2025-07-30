import { Artist, Song } from "@/models";
import { useMusicStore } from "@/store/songsStore";
import { useEffect, useState } from "react";

export const useGetArtistBySong = (song: Song) => {
	const getArtistById = useMusicStore((state) => state.getArtistById);

	const [artist, setArtist] = useState<Artist | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const load = async () => {
			if (!song?.artistId) {
				setArtist(null);
				return;
			}

			setIsLoading(true);
			setError(null);
			try {
				const fetchedArtist = await getArtistById(song.artistId);
				setArtist(fetchedArtist);
			} catch (err) {
				console.error("Error loading artist by song", err);
				setArtist(null);
				setError(err as Error);
			} finally {
				setIsLoading(false);
			}
		};

		load();
	}, [getArtistById, song.artistId]);

	return { artist, isLoading, error };
};
