// app/song/[id].tsx
import Cover from "@/components/partials/Cover";
import { useGetPlayingSongAndArtist } from "@/hooks/useGetPlayingSondAndArtist";
import { useWindowDimensions } from "react-native";
import { Text, YStack } from "tamagui";

const SongDetailScreen: React.FC = () => {
	const { width } = useWindowDimensions();
	const { song, artist, isLoading } = useGetPlayingSongAndArtist();

	if (isLoading || !song) return <Text>Cargando...</Text>;

	return (
		<YStack padding="$4" gap="$4" flexDirection="column" alignItems="center">
			<Text fontFamily="$inter" fontWeight={"800"} fontSize={"$9"}>
				{song.title}
			</Text>
			<Text fontFamily="$inter" fontWeight={"400"} fontSize={"$8"}>
				{artist?.name}
			</Text>
			<Cover
				coverPath={song.coverPath || ""}
				alternativeCoverOpacity={1}
				style={{ borderRadius: 8 }}
				size={width * 0.8}
			/>
		</YStack>
	);
};

export default SongDetailScreen;
