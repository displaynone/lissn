import { useGetPlayingSongAndArtist } from "@/hooks/useGetPlayingSondAndArtist";
import {
	useGetIsPausedSong,
	useGetPlayingSong,
	useGetPlaySong,
	useGetTooglePauseSong,
} from "@/store/usePlayerStore";
import { tamaguiConfig } from "@/tamagui.config";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { Button, XStack } from "tamagui";
import NextIcon from "../icons/NextIcon";
import PauseIcon from "../icons/PauseIcon";
import PlayIcon from "../icons/PlayIcon";
import PrevIcon from "../icons/PrevIcon";
import Cover from "./Cover";

const Player: React.FC = () => {
	const { song, isLoading } = useGetPlayingSongAndArtist();
	const router = useRouter();
	const playSong = useGetPlaySong();
	const togglePause = useGetTooglePauseSong();
	const playingSong = useGetPlayingSong();
	const isPaused = useGetIsPausedSong();
	const [playingSongId, setPlayingSongId] = useState<string>('');

	useEffect(() => {
		if (song && playingSongId !== song.id && playingSong?.id !== song.id) {
			playSong(song);
			setPlayingSongId(song.id);
		}
	}, [song, playSong, playingSongId, playingSong?.id]);

	if (isLoading || !song) return null;

	return (
		<Animated.View style={styles.container}>
			<BlurView
				intensity={10}
				tint="regular"
				experimentalBlurMethod="dimezisBlurView"
				style={styles.blur}
			>
				<XStack gap={"$4"} maxWidth={"100%"}>
					<Pressable onPress={() => router.push("/song/playing")}>
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
							onPress={async () => togglePause()}
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
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 16,
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
	fullScreenContainer: {
		width: "100%",
		height: "100%",
		borderRadius: 0,
		margin: 0,
	},
	fullScreenWrapper: {
		height: "100%",
		padding: 16,
		flexDirection: "column-reverse",
	},
	blur: {
		padding: 32,
		maxWidth: "100%",
		borderRadius: 16,
		overflow: "hidden",
		backgroundColor: "rgba(72, 72, 72, 0.3)",
	},
	coverFullScreen: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: "100%",
		height: "100%",
		borderRadius: 0,
	},
});

export default Player;
