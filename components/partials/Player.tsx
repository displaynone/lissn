import { Artist, Song } from "@/models";
import { useGetPlayingSongId, useMusicStore } from "@/store/songsStore";
import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, YStack } from "tamagui";
import { Loading } from "../ui/Loading";

const Player: React.FC = () => {
	const sound = useRef<Audio.Sound | null>(null);

	const playingSongId = useGetPlayingSongId();
	const getSongById = useMusicStore((state) => state.getSongById);
	const getArtistById = useMusicStore((state) => state.getArtistById);
	const [song, setSong] = useState<Song | null>(null);
	const [loadingSong, setLoadingSong] = useState(true);
	const [loadingArtist, setLoadingArtist] = useState(true);
	const [artist, setArtist] = useState<Artist | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);

	console.log({ isPlaying });

	const loadSong = useCallback(() => {
		if (!playingSongId) {
			if (sound.current) {
				sound.current.unloadAsync();
				sound.current = null;
			}
		}
		const fetchSong = async () => {
			if (playingSongId) {
				const fetchedSong = await getSongById(playingSongId || "");
				setSong(fetchedSong);
				setLoadingSong(false);
			}
		};
		return fetchSong();
	}, [getSongById, playingSongId]);

	useEffect(() => {
		if (!song) {
			return;
		}
		const fetchArtist = async () => {
			const fetchedArtist = await getArtistById(song.artistId);
			setArtist(fetchedArtist);
			setLoadingArtist(false);
		};
		fetchArtist();
	}, [getArtistById, song]);

	const playSound = useCallback(async () => {
		const doIt = async () => {
			if (!song) {
				return;
			}
			console.log("Playing sound", song.title);

			if (sound.current) {
				await sound.current.unloadAsync();
				sound.current = null;
			}

			const { sound: playbackObject } = await Audio.Sound.createAsync(
				{ uri: song.sourceUri },
				{ shouldPlay: true }
			);
			sound.current = playbackObject;
			console.log("playAsync", sound.current.playAsync);
			await sound.current.playAsync();
		};
		if (!song) {
			loadSong().then(doIt);
		} else {
			await doIt();
		}
	}, [loadSong, song]);

	const stopSound = async () => {
		console.log("Stopping sound", sound.current);
		if (sound.current) {
			console.log(
				"sound.current instanceof Audio.Sound",
				sound.current instanceof Audio.Sound
			);
			try {
				console.log("stopAsync", sound.current.stopAsync);
				await sound.current.stopAsync();
			} catch (error) {
				console.error("Error stopping sound:", error);
			}
			console.log("Sound stopped");
		}
	};

	useEffect(() => {
		return () => {
			if (sound.current) {
				sound.current.unloadAsync();
				sound.current = null;
			}
		};
	}, []);

	console.log("playingSongId", playingSongId);
	useEffect(() => {
		if (playingSongId && !isPlaying) {
			const play = async () => {
				console.log("Playing sound because isPlaying is true");
				await playSound();
			};
			setIsPlaying(true);
			play();
		}
	}, [isPlaying, playSound, playingSongId]);

	useEffect(() => {
		if (!playingSongId && isPlaying) {
			const stop = async () => {
				console.log("Stopping sound because playingSongId is undefined");
				await stopSound();
			};
			setIsPlaying(false);
			stop();
		}
	}, [isPlaying, playingSongId, song]);

	if (loadingArtist || loadingSong) {
		return <Loading />;
	}

	if (!song) {
		return <Text>No song is currently playing.</Text>;
	}

	return (
		<YStack gap="$2">
			<Text>Now Playing: {song.title}</Text>
			{!!artist && <Text>Artist: {artist.name}</Text>}
		</YStack>
	);
};

export default Player;
