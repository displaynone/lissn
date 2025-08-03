import { useGetPlayingSongAndArtist } from "@/hooks/useGetPlayingSondAndArtist";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";
import {
	useGetIsPausedSong,
	useGetIsStoppedSong,
	useGetPlaySong,
	useGetTooglePauseSong
} from "@/store/usePlayerStore";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { Button, View, XStack } from "tamagui";
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

const COVER_SIZE = 56;

const Player: React.FC<PlayerProps> = ({
	showCover = true,
	styleContainer = {},
	isBlurred = true,
}) => {
	const { song, isLoading } = useGetPlayingSongAndArtist();
	const router = useRouter();
	const togglePause = useGetTooglePauseSong();
	const play = useGetPlaySong();
	const isPaused = useGetIsPausedSong();
	const isStopped = useGetIsStoppedSong();
	const { progress } = usePlayerProgress();

	if (isLoading || !song) return null;

	return (
		<Animated.View style={{ ...styles.container, ...styleContainer }}>
			<View style={styles.blurContainer}>
				<BlurView
					intensity={10}
					tint="dark"
					experimentalBlurMethod={isBlurred ? "dimezisBlurView" : "none"}
					style={styles.blur}
				/>
				<XStack
					gap={"$4"}
					alignItems="center"
					backgroundColor={
						isBlurred ? "$backgroundTransparent05" : "$backgroundTransparent10"
					}
					p="$2"
				>
					{showCover && (
						<Pressable onPress={() => router.push("/song/playing")}>
							<Cover
								coverPath={song.coverPath || ""}
								alternativeCoverOpacity={1}
								borderRadius={50}
								size={COVER_SIZE}
							/>
							<View pos="absolute">
								<CircularProgress size={COVER_SIZE + 4} progress={progress} />
							</View>
						</Pressable>
					)}
					<Button circular backgroundColor={"transparent"}>
						<PrevIcon color="white" />
					</Button>
					<Button
						circular
						backgroundColor={"transparent"}
						onPress={async () => isStopped ? play(song) : togglePause()}
					>
						{isPaused ? (
							<PlayIcon color="white" />
						) : (
							<PauseIcon color="white" />
						)}
					</Button>
					<Button circular backgroundColor={"transparent"}>
						<NextIcon color="white" />
					</Button>
				</XStack>
			</View>
		</Animated.View>
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
