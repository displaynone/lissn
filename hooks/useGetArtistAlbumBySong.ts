import { Album, Artist, Song } from "@/models";
import { useMusicStore } from "@/store/songsStore";
import { useEffect, useState } from "react";

export const useGetArtistAlbumBySong = (song?: Song) => {
	const getArtistById = useMusicStore((state) => state.getArtistById);
	const getAlbumById = useMusicStore((state) => state.getAlbumById);

	const [artist, setArtist] = useState<Artist | null>(null);
	const [album, setAlbum] = useState<Album | null>(null);
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
				const fetchedAlbum = await getAlbumById(song.albumId);
				setAlbum(fetchedAlbum);
			} catch (err) {
				console.error("Error loading artist or album by song", err);
				setArtist(null);
				setError(err as Error);
			} finally {
				setIsLoading(false);
			}
		};

		load();
	}, [getAlbumById, getArtistById, song?.albumId, song?.artistId]);

	return { artist, album, isLoading, error };
};
