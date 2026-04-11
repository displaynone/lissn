import Heading from "@/components/partials/Heading";
import Player from "@/components/partials/Player";
import SongBlockItem from "@/components/partials/SongBlockItem";
import SongItem from "@/components/partials/SongItem";
import { H2 } from "@/components/ui/Headings";
import { Song } from "@/models";
import {
	useAreSongsLoading,
	useGetGetRecentlyPlayed,
	useGetSongs,
	useRefreshSongs,
} from "@/store/songsStore";
import { useGetPlayingSong } from "@/store/usePlayerStore";
import { Trans } from "@lingui/react/macro";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useState } from "react";
import { Spinner, Text, View, YStack } from "tamagui";

const INITIAL_SONGS_HEIGHT = 230;
const RECENT_LIST_HEIGHT = 164;
const SONG_LIST_BOTTOM_SPACING = 140;

export default function HomeScreen() {
	const songs = useGetSongs();
	const isLoading = useAreSongsLoading();
	const refreshSongs = useRefreshSongs();
	const getRecentlyPlayed = useGetGetRecentlyPlayed();
	const playingSong = useGetPlayingSong();
	const [recent, setRecent] = useState<Song[]>([]);
	const [loadingRecent, setLoadingRecent] = useState(true);
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		let cancelled = false;

		if (initialized) {
			return () => {
				cancelled = true;
			};
		}

		setInitialized(true);
		getRecentlyPlayed()
			.then((recentSongs) => {
				if (cancelled) return;
				setRecent(recentSongs);
				setLoadingRecent(false);
			})
			.catch(() => {
				if (cancelled) return;
				setLoadingRecent(false);
			});

		return () => {
			cancelled = true;
		};
	}, [getRecentlyPlayed, initialized]);

	useEffect(() => {
		if (!playingSong?.id) return;

		getRecentlyPlayed().then((recentSongs) => {
			setRecent(recentSongs);
			setLoadingRecent(false);
		});
	}, [getRecentlyPlayed, playingSong?.id]);

	const showLoading = isLoading || songs.length === 0;

	const Loading = (
		<YStack
			flex={1}
			justifyContent="center"
			alignItems="center"
			h={INITIAL_SONGS_HEIGHT}
		>
			{isLoading && <Spinner size="large" color="$blue10" />}
			<Text mt="$4" color="$gray11">
				{isLoading ? "Loading songs..." : "No songs found"}
			</Text>
		</YStack>
	);

	return (
		<YStack flex={1} gap="$2" h="100%">
			<Heading />
			<YStack flex={1} gap="$4">
				{!loadingRecent && (
					<YStack p="$4" gap="$4">
						<H2>
							<Trans>Recently played</Trans>
						</H2>
						{!!recent.length ? (
							<FlashList
								data={recent}
								horizontal
								style={{ height: RECENT_LIST_HEIGHT }}
								keyExtractor={(song) => song.id}
								renderItem={({ item }) => <SongBlockItem song={item} />}
								ItemSeparatorComponent={() => <View w={12} />}
							/>
						) : (
							<YStack
								h={RECENT_LIST_HEIGHT}
								justifyContent="center"
								alignItems="center"
							>
								<Text color="$gray11">
									<Trans>No recently played songs yet</Trans>
								</Text>
							</YStack>
						)}
					</YStack>
				)}

				<YStack flex={1} minHeight={INITIAL_SONGS_HEIGHT}>
					<H2 paddingHorizontal="$4" paddingBottom="$4">
						<Trans>Last songs</Trans>
					</H2>
					{showLoading && Loading}
					{!showLoading && (
						<FlashList
							data={songs}
							style={{ flex: 1 }}
							contentContainerStyle={{
								paddingBottom: SONG_LIST_BOTTOM_SPACING,
							}}
							keyExtractor={(song) => song.id}
							renderItem={({ item }) => (
								<SongItem song={item} origin="latest" />
							)}
							ItemSeparatorComponent={() => <View h={18} />}
							showsVerticalScrollIndicator={true}
							onEndReachedThreshold={0.5}
							onEndReached={() => {
								refreshSongs();
							}}
						/>
					)}
				</YStack>
			</YStack>
			<Player />
		</YStack>
	);
}
