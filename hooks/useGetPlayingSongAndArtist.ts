import { Artist, Song } from "@/models";
import { useGetPlayingSongId, useMusicStore } from "@/store/songsStore";
import { useEffect, useState } from "react";

export const useGetPlayingSongAndArtist = () => {
	const playingSongId = useGetPlayingSongId();
	const getSongById = useMusicStore((state) => state.getSongById);
	const getArtistById = useMusicStore((state) => state.getArtistById);

	const [song, setSong] = useState<Song | null>(null);
	const [artist, setArtist] = useState<Artist | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const load = async () => {
			if (!playingSongId) {
				setSong(null);
				setArtist(null);
				return;
			}

			setIsLoading(true);
			try {
				const fetchedSong = await getSongById(playingSongId);
				setSong(fetchedSong);
				if (fetchedSong?.artistId) {
					const fetchedArtist = await getArtistById(fetchedSong.artistId);
					setArtist(fetchedArtist);
				} else {
					setArtist(null);
				}
			} catch (err) {
				console.error("Error loading song and artist", err);
				setSong(null);
				setArtist(null);
			} finally {
				setIsLoading(false);
			}
		};

		load();
	}, [getArtistById, getSongById, playingSongId]);

	return { song, artist, isLoading };
};
