import { Artist, Song } from "@/models";
import { useGetPlayingSongId, useMusicStore } from "@/store/songsStore";
import { tamaguiConfig } from "@/tamagui.config";
import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Button, Text, View, XStack, YStack } from "tamagui";
import NextIcon from "../icons/NextIcon";
import PauseIcon from "../icons/PauseIcon";
import PlayIcon from "../icons/PlayIcon";
import PrevIcon from "../icons/PrevIcon";
import Cover from "./Cover";

const Player: React.FC = () => {
	const playerRef = useRef<AudioPlayer | null>(null);
	const isMounted = useRef(true);

	const playingSongId = useGetPlayingSongId();
	const getSongById = useMusicStore((s) => s.getSongById);
	const getArtistById = useMusicStore((s) => s.getArtistById);
	const setPlayingSongId = useMusicStore((s) => s.setPlayingSongId);

	const [song, setSong] = useState<Song | null>(null);
	const [artist, setArtist] = useState<Artist | null>(null);
	const [loading, setLoading] = useState(false);
	const [showSongDetails, setShowSongDetails] = useState(false);
	const [isPaused, setIsPaused] = useState(false);

	// Limpieza al desmontar
	useEffect(() => {
		return () => {
			isMounted.current = false;
			if (playerRef.current) {
				playerRef.current.pause();
				playerRef.current = null;
			}
		};
	}, []);

	const stopCurrentSound = useCallback(() => {
		if (playerRef.current) {
			try {
				playerRef.current.pause();
			} catch (err) {
				console.error("Error stopping player:", err);
			}
			playerRef.current = null;
		}
	}, []);

	const loadAndPlaySong = useCallback(
		async (id: string) => {
			setLoading(true);
			try {
				const fetchedSong = await getSongById(id);
				if (!fetchedSong) {
					console.warn("No se encontró la canción con id:", id);
					if (isMounted.current) {
						setSong(null);
						setArtist(null);
					}
					return;
				}

				const fetchedArtist = await getArtistById(fetchedSong.artistId);
				if (!isMounted.current) return;

				setSong(fetchedSong);
				setArtist(fetchedArtist ?? null);

				stopCurrentSound();

				const player = createAudioPlayer(fetchedSong.sourceUri);
				player.play();
				playerRef.current = player;
			} catch (err) {
				console.error("Error loading song or artist:", err);
			} finally {
				if (isMounted.current) setLoading(false);
			}
		},
		[getSongById, getArtistById, stopCurrentSound]
	);

	useEffect(() => {
		if (!playingSongId) {
			stopCurrentSound();
			if (isMounted.current) {
				setSong(null);
				setArtist(null);
			}
		} else {
			loadAndPlaySong(playingSongId);
		}
	}, [playingSongId, loadAndPlaySong, stopCurrentSound]);

	if (loading || !song) {
		return <></>;
	}

	return (
		<View style={styles.container}>
			{showSongDetails && (
				<BlurView
					intensity={10}
					tint="regular"
					experimentalBlurMethod="dimezisBlurView"
					style={styles.blur}
				>
					<YStack gap="$2" flex={1}>
						<Text
							fontFamily="$inter"
							fontWeight={"200"}
							fontSize={"$6"}
							maxWidth={"100%"}
						>
							{song.title}
						</Text>
						<Text
							fontFamily="$inter"
							fontWeight={"100"}
							fontSize={"$5"}
							textTransform="uppercase"
						>
							{artist?.name || "Unknown Artist"}
						</Text>
					</YStack>
				</BlurView>
			)}
			<BlurView
				intensity={10}
				tint="regular"
				experimentalBlurMethod="dimezisBlurView"
				style={styles.blur}
			>
				<XStack gap={"$4"} maxWidth={"100%"}>
					<Pressable onPress={() => setShowSongDetails(!showSongDetails)}>
						<Cover
							coverPath={song.coverPath || ""}
							alternativeCoverOpacity={1}
						/>
					</Pressable>
					<XStack gap="$4" flex={1} alignItems="center" justifyContent="center">
						<Button
							circular
							backgroundColor={tamaguiConfig.tokens.color.primary}
						>
							<PrevIcon />
						</Button>
						<Button
							circular
							backgroundColor={tamaguiConfig.tokens.color.primary}
							onPress={async () => {
								if (!playerRef.current) return;

								if (isPaused) {
									await playerRef.current.play();
									setIsPaused(false);
								} else {
									await playerRef.current.pause();
									setIsPaused(true);
								}
							}}
						>
							{isPaused ? <PlayIcon /> : <PauseIcon />}
						</Button>
						<Button
							circular
							backgroundColor={tamaguiConfig.tokens.color.primary}
						>
							<NextIcon />
						</Button>
					</XStack>
				</XStack>
			</BlurView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 8,
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		maxWidth: "100%",
		borderRadius: 16,
		overflow: "hidden",
		flexDirection: "column",
		gap: 8,
	},
	blur: {
		padding: 32,
		maxWidth: "100%",
		borderRadius: 16,
		overflow: "hidden",
	},
});

export default Player;
