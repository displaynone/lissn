import Heading from "@/components/partials/Heading";
import Player from "@/components/partials/Player";
import SongItem from "@/components/partials/SongItem";
import { useGetSongs } from "@/store/songsStore";
import { ScrollView, YStack } from "tamagui";

export default function HomeScreen() {
	const songs = useGetSongs();
	return (
		<ScrollView
			padding="$2"
			flex={1}
			contentContainerStyle={{
				flexGrow: 1,
				minHeight: "100%",
				gap: "$8",
			}}
		>
			<Heading />
			<YStack
				gap="$4"
			>
				{songs.map((song, i) => (
					<SongItem key={i} song={song} />
				))}
			</YStack>
			<Player />
		</ScrollView>
	);
}
