import Heading from "@/components/partials/Heading";
import Player from "@/components/partials/Player";
import SongItem from "@/components/partials/SongItem";
import { useAreSongsLoading, useGetSongs } from "@/store/songsStore";
import { FlashList } from "@shopify/flash-list";
import { Spinner, Text, View, YStack } from "tamagui";

export default function HomeScreen() {
	const songs = useGetSongs();
	const isLoading = useAreSongsLoading();

	// Show loading state while songs are being loaded
	if (isLoading || songs.length === 0) {
		return (
			<YStack flex={1} justifyContent="center" alignItems="center">
				<Spinner size="large" color="$blue10" />
				<Text mt="$4" color="$gray11">
					{isLoading ? "Loading songs..." : "No songs found"}
				</Text>
			</YStack>
		);
	}

	return (
		<YStack flex={1}>
			<Heading />
			<FlashList
				data={songs}
				keyExtractor={(song) => song.id}
				renderItem={({ item }) => <SongItem song={item} />}
				ItemSeparatorComponent={() => <View h={12} />}
				estimatedItemSize={100}
				showsVerticalScrollIndicator={false}
			/>
			<Player />
		</YStack>
	);
}
