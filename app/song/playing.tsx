import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import Cover from "@/components/partials/Cover";
import Player from "@/components/partials/Player";
import SongTrack from "@/components/partials/SongTrack";
import { AutoMarquee } from "@/components/ui/AutoMarquee";
import { Loading } from "@/components/ui/Loading";
import { Text } from "@/components/ui/Text";
import { SHOW_PLAYING_PAGE_SLIDE_TIME } from "@/constants/generic";
import { useGetPlayingSongAndArtist } from "@/hooks/useGetPlayingSongAndArtist";
import { useGetSetSongDetailPageLoaded } from "@/store/appStore";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Button, View, XStack, YStack } from "tamagui";

const SongDetailScreen: React.FC = () => {
	const router = useRouter();
	const { width, height: windowHeight } = useWindowDimensions();
	const { song, artist, isLoading } = useGetPlayingSongAndArtist();
	const height = useSharedValue(windowHeight);
	const [showPage, setShowPage] = useState(false);
	const setPageLoaded = useGetSetSongDetailPageLoaded();

	const animatedStyle = useAnimatedStyle(() => {
		return {
			height: height.value,
		};
	});

	useEffect(() => {
		if (showPage) {
			height.value = withTiming(0, { duration: SHOW_PLAYING_PAGE_SLIDE_TIME });
			setPageLoaded(true);
		}
	});

	if (isLoading || !song) {
		return <Loading />;
	}

	const handleBack = () => {
		setPageLoaded(false);
		router.back();
	};

	return (
		<View>
			<Animated.View
				style={[
					{
						width: "100%",
						backgroundColor: "transparent",
					},
					animatedStyle,
				]}
			></Animated.View>
			<YStack padding="$6" gap="$4" flexDirection="column" alignItems="center">
				<XStack justifyContent="flex-start" w={"100%"}>
					<Button circular backgroundColor={"transparent"} onPress={handleBack}>
						<ArrowLeftIcon color="white" />
					</Button>
				</XStack>
				<AutoMarquee
					textProps={{
						fontFamily: "$inter",
						fontWeight: "800",
						fontSize: "$7",
						textAlign: "center",
						color: "white",
					}}
					text={song.title}
				/>
				<Text
					fontFamily="$inter"
					fontWeight={"400"}
					fontSize={"$6"}
					onPress={() => router.push(`/artists/${artist?.id}`)}
				>
					{artist?.name}
				</Text>
				<Cover
					coverPath={song.coverPath || ""}
					alternativeCoverOpacity={1}
					size={width * 0.8}
					onLoad={() => setShowPage(true)}
				/>
				<SongTrack />
				<Player
					showCover={false}
					styleContainer={{ position: "relative", bottom: 0 }}
					isBlurred={false}
				/>
			</YStack>
		</View>
	);
};

export default SongDetailScreen;
