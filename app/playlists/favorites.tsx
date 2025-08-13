import Heading from "@/components/partials/Heading";
import Player from "@/components/partials/Player";
import SongItem from "@/components/partials/SongItem";
import { Song } from "@/models";
import {
	useGetSetSongsListScrollPosition,
	useGetSongsFavoriteListScrollPosition,
} from "@/store/appStore";
import { useAreSongsLoading, useGetFavoriteSongs, useRefreshSongs } from "@/store/songsStore";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useRef } from "react";
import { Spinner, Text, View, YStack } from "tamagui";

export default function FavoritesScreen() {
	const songs = useGetFavoriteSongs();
	const isLoading = useAreSongsLoading();
	const refreshSongs = useRefreshSongs();

	const setSongsListScrollPosition = useGetSetSongsListScrollPosition();
	const offset = useGetSongsFavoriteListScrollPosition();
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
				ref={listRef}
				data={songs}
				keyExtractor={(song) => song.id}
				renderItem={({ item }) => <SongItem song={item} />}
				ItemSeparatorComponent={() => <View h={12} />}
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
			<Player />
		</YStack>
	);
}
