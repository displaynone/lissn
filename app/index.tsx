import Heading from "@/components/partials/Heading";
import Player from "@/components/partials/Player";
import SongItem from "@/components/partials/SongItem";
import { useGetSongs } from "@/store/songsStore";
import { FlashList } from "@shopify/flash-list";
import { View, YStack } from "tamagui";

export default function HomeScreen() {
	const songs = useGetSongs();

	return (
		<YStack flex={1}>
			<Heading />
			<FlashList
				data={songs}
				keyExtractor={(song) => song.id}
				renderItem={({ item }) => <SongItem song={item} />}
				ItemSeparatorComponent={() => <View h={"$1"} />}
				estimatedItemSize={100}
			/>
			<Player />
		</YStack>
	);
}
