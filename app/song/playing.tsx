// app/song/[id].tsx
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import Cover from "@/components/partials/Cover";
import Player from "@/components/partials/Player";
import SongTrack from "@/components/partials/SongTrack";
import { useGetPlayingSongAndArtist } from "@/hooks/useGetPlayingSondAndArtist";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import { Button, Text, XStack, YStack } from "tamagui";

const SongDetailScreen: React.FC = () => {
	const router = useRouter();
	const { width } = useWindowDimensions();
	const { song, artist, isLoading } = useGetPlayingSongAndArtist();

	if (isLoading || !song) return <Text>Cargando...</Text>;

	return (
		<YStack padding="$6" gap="$4" flexDirection="column" alignItems="center">
			<XStack justifyContent="flex-start" w={"100%"}>
				<Button
					circular
					backgroundColor={"transparent"}
					onPress={() => router.back()}
				>
					<ArrowLeftIcon color="white" />
				</Button>
			</XStack>
			<Text
				fontFamily="$inter"
				fontWeight={"800"}
				fontSize={"$7"}
				textAlign="center"
			>
				{song.title}
			</Text>
			<Text fontFamily="$inter" fontWeight={"400"} fontSize={"$6"}>
				{artist?.name}
			</Text>
			<Cover
				coverPath={song.coverPath || ""}
				alternativeCoverOpacity={1}
				size={width * 0.8}
				// borderRadius={width}
			/>
			<SongTrack />
			<Player
				showCover={false}
				styleContainer={{ position: "relative" }}
				isBlurred={false}
			/>
		</YStack>
	);
};

export default SongDetailScreen;
