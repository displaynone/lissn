import { useGetPlayingSongAndArtist } from "@/hooks/useGetPlayingSondAndArtist";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";
import { useGetSeekToSong } from "@/store/usePlayerStore";
import { formatSeconds } from "@/utils/formatSeconds";
import AudioWaveView from "@kaannn/react-native-waveform";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { useWindowDimensions } from "react-native";
import Animated, { runOnJS } from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

const SongTrack: React.FC = () => {
	const { song, isLoading } = useGetPlayingSongAndArtist();
	const { width } = useWindowDimensions();
	const { progress, currentTime, duration } = usePlayerProgress();
	const seekTo = useGetSeekToSong();

	const waveformWidth = width * 0.8;

const panGesture = Gesture.Tap()
	.onStart((event) => {
		const touchX = Math.max(0, Math.min(event.x, waveformWidth));
		const percentage = touchX / waveformWidth;
		const seekTime = duration * percentage;
		runOnJS(seekTo)(seekTime);  // <- Llamada segura al JS thread
	});

	if (isLoading || !song) {
		return <></>;
	}

	return (
		<YStack
			p="$4"
			backgroundColor={"$backgroundTransparent10"}
			borderRadius={"$4"}
			gap="$2"
		>
			<GestureDetector gesture={panGesture}>
				<Animated.View>
					<AudioWaveView
						style={{ width: waveformWidth, height: 50 }}
						audioFileUri={song.sourceUri}
						waveWidth={8}
						waveGap={2}
						waveMinHeight={25}
						waveCornerRadius={0}
						waveBackgroundColor="#bbbbbb"
						waveProgressColor="#ffffff"
						progress={progress}
					/>
				</Animated.View>
			</GestureDetector>
			<XStack justifyContent="space-between">
				<Text
					fontFamily="$inter"
					fontWeight={"400"}
					fontSize={"$4"}
					textTransform="uppercase"
					alignSelf="center"
				>
					{formatSeconds(currentTime || 0)}
				</Text>
				<Text
					fontFamily="$inter"
					fontWeight={"400"}
					fontSize={"$4"}
					textTransform="uppercase"
					alignSelf="center"
				>
					{formatSeconds(duration || 0)}
				</Text>
			</XStack>
		</YStack>
	);
};

export default SongTrack;
