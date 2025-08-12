import { borderBottomGradientColors, borderTopGradientColors, COVER_SIZE, COVER_STROKE_WIDTH } from "@/constants/generic";
import { useGetPlayingSongAndArtist } from "@/hooks/useGetPlayingSongAndArtist";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";
import {
	useGetIsPausedSong,
	useGetIsStoppedSong,
	useGetPlayNextSong,
	useGetPlayPreviousSong,
	useGetPlaySong,
	useGetTooglePauseSong,
} from "@/store/usePlayerStore";
import { LinearGradient } from "@tamagui/linear-gradient";
import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS } from "react-native-reanimated";
import { Button, useWindowDimensions, View, XStack } from "tamagui";
import NextIcon from "../icons/NextIcon";
import PauseIcon from "../icons/PauseIcon";
import PlayIcon from "../icons/PlayIcon";
import PrevIcon from "../icons/PrevIcon";
import { CircularProgress } from "../ui/CircularProgress";
import Cover from "./Cover";

type PlayerProps = {
	showCover?: boolean;
	styleContainer?: ViewStyle;
	isBlurred?: boolean;
};

const Player: React.FC<PlayerProps> = ({
	showCover = true,
	styleContainer = {},
	isBlurred = true,
}) => {
	const { song, isLoading } = useGetPlayingSongAndArtist();
	const router = useRouter();
	const path = usePathname();
	const togglePause = useGetTooglePauseSong();
	const play = useGetPlaySong();
	const playNext = useGetPlayNextSong();
	const playPrev = useGetPlayPreviousSong();
	const isPaused = useGetIsPausedSong();
	const isStopped = useGetIsStoppedSong();
	const { progress } = usePlayerProgress();
	const { height } = useWindowDimensions();

	const panGesture = Gesture.Pan()
		.onUpdate((event) => {
			// Opcional: podrías hacer una animación visual aquí
		})
		.onEnd((event) => {
			if (event.translationY < -(height / 3) && path !== "/song/playing") {
				runOnJS(router.push)("/song/playing");
			}
		});

	if (isLoading || !song) return null;



	return (
		<GestureDetector gesture={panGesture}>
			<Animated.View style={{ ...styles.container, ...styleContainer }}>
				<View style={styles.blurContainer}>
					<BlurView
						intensity={10}
						tint="dark"
						experimentalBlurMethod={isBlurred ? "dimezisBlurView" : "none"}
						style={styles.blur}
					/>

					<LinearGradient
						colors={borderTopGradientColors}
						start={[0, 1]}
						end={[1, 1]}
						flex={1}
						justifyContent="center"
						alignItems="center"
						borderRadius="$4"
						pos="absolute"
						width="100%"
						h={1}
					></LinearGradient>
					<XStack
						gap={"$4"}
						alignItems="center"
						backgroundColor={
							isBlurred
								? "$backgroundTransparent05"
								: "$backgroundTransparent10"
						}
						p="$2"
					>
						{showCover && (
							<Pressable onPress={() => router.push("/song/playing")}>
								<Cover
									coverPath={song.coverPath || ""}
									alternativeCoverOpacity={1}
									borderRadius={COVER_SIZE}
									size={COVER_SIZE - COVER_STROKE_WIDTH * 2}
								/>
								<View pos="absolute">
									<CircularProgress size={COVER_SIZE} progress={progress} />
								</View>
							</Pressable>
						)}
						<Button
							circular
							backgroundColor={"transparent"}
							onPress={() => playPrev()}
						>
							<PrevIcon color="white" />
						</Button>
						<Button
							circular
							backgroundColor={"transparent"}
							onPress={async () => (isStopped ? play(song) : togglePause())}
						>
							{isPaused ? (
								<PlayIcon color="white" />
							) : (
								<PauseIcon color="white" />
							)}
						</Button>
						<Button
							circular
							backgroundColor={"transparent"}
							onPress={() => playNext()}
						>
							<NextIcon color="white" />
						</Button>
					</XStack>
					<LinearGradient
						colors={borderBottomGradientColors}
						start={[0, 1]}
						end={[1, 1]}
						flex={1}
						justifyContent="center"
						alignItems="center"
						borderRadius="$4"
						pos="absolute"
						b={0}
						width="100%"
						h={1}
					></LinearGradient>
				</View>
			</Animated.View>
		</GestureDetector>
	);
};

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 32,
		marginVertical: 16,
		overflow: "hidden",
		flexDirection: "column",
		gap: 8,
		alignSelf: "center",
		borderRadius: 50,
		position: "absolute",
		bottom: 0,
	},
	blurContainer: {
		borderRadius: 50,
		overflow: "hidden",
		width: "auto",
	},
	blur: {
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
	},
});

export default Player;
