import { Artist, Song } from "@/models";
import { useGetPlayingSongId, useMusicStore } from "@/store/songsStore";
import { useGetPlayingSong } from "@/store/usePlayerStore";
import { useEffect, useState } from "react";

export const useGetPlayingSongAndArtist = () => {
	const playingSongId = useGetPlayingSongId();
	const playingSong = useGetPlayingSong();
	const getSongById = useMusicStore((state) => state.getSongById);
	const getArtistById = useMusicStore((state) => state.getArtistById);

	const [song, setSong] = useState<Song | null>(playingSong);
	const [artist, setArtist] = useState<Artist | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const load = async () => {
			if (playingSong) {
				setSong(playingSong);
			}

			const currentSong = playingSong || (playingSongId ? await getSongById(playingSongId) : null);

			if (!currentSong) {
				setSong(null);
				setArtist(null);
				return;
			}

			setIsLoading(true);
			try {
				setSong(currentSong);
				if (currentSong.artistId) {
					const fetchedArtist = await getArtistById(currentSong.artistId);
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
	}, [getArtistById, getSongById, playingSong, playingSongId]);

	return { song, artist, isLoading };
};
