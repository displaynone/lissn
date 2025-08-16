import Heading from "@/components/partials/Heading";
import Player from "@/components/partials/Player";
import SongItem from "@/components/partials/SongItem";
import { Song } from "@/models";
import {
	useGetSetSongsListScrollPosition,
	useGetSongsListScrollPosition,
} from "@/store/appStore";
import {
	useAreSongsLoading,
	useGetSongs,
	useRefreshSongs,
} from "@/store/songsStore";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useRef } from "react";
import { Spinner, Text, View, YStack } from "tamagui";

export default function SongsScreen() {
	const songs = useGetSongs();
	const isLoading = useAreSongsLoading();
	const setSongsListScrollPosition = useGetSetSongsListScrollPosition();
	const refreshSongs = useRefreshSongs();
	const offset = useGetSongsListScrollPosition();
	const listRef = useRef<FlashList<Song>>(null);

	const handleRestoreScroll = useCallback(() => {
		if (listRef.current && offset > 0) {
			listRef.current.scrollToOffset({ offset, animated: false });
		}
	}, [offset]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			handleRestoreScroll();
		}, 500);

		return () => clearTimeout(timeout);
	}, [handleRestoreScroll]);

	const showLoading = isLoading || songs.length === 0;

	const Loading = (
		<YStack flex={1} justifyContent="center" alignItems="center">
			{isLoading && <Spinner size="large" color="$blue10" />}
			<Text mt="$4" color="$gray11">
				{isLoading ? "Loading songs..." : "No songs found"}
			</Text>
		</YStack>
	);

	return (
		<YStack flex={1}>
			<Heading />
			{showLoading && Loading}
			{!showLoading && (
				<FlashList
					ref={listRef}
					data={songs}
					keyExtractor={(song) => song.id}
					renderItem={({ item }) => <SongItem song={item} />}
					ItemSeparatorComponent={() => <View h={18} />}
					estimatedItemSize={50}
					ListFooterComponent={<View style={{ height: 40 }} />}
					showsVerticalScrollIndicator={true}
					onScroll={(e) =>
						setSongsListScrollPosition(e.nativeEvent.contentOffset.y)
					}
					onEndReachedThreshold={0.5}
					onEndReached={() => {
						refreshSongs();
					}}
				/>
			)}
			<Player />
		</YStack>
	);
}
