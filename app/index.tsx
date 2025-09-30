import Heading from "@/components/partials/Heading";
import Player from "@/components/partials/Player";
import SongBlockItem from "@/components/partials/SongBlockItem";
import SongItem from "@/components/partials/SongItem";
import { H2 } from "@/components/ui/Headings";
import { Song } from "@/models";
import {
	useAreSongsLoading,
	useGetGetRecentlyPlayed,
	useGetSearch,
	useGetSongs,
	useRefreshSongs,
} from "@/store/songsStore";
import { tamaguiConfig } from "@/tamagui.config";
import { Trans } from "@lingui/react/macro";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useState } from "react";
import {
	LayoutChangeEvent,
	LayoutRectangle,
	useWindowDimensions,
} from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Spinner, Text, View, YStack } from "tamagui";

const INITIAL_SONGS_HEIGHT = 230;

export default function HomeScreen() {
	const { width } = useWindowDimensions();
	const songs = useGetSongs();
	const isLoading = useAreSongsLoading();
	const refreshSongs = useRefreshSongs();
	const search = useGetSearch();
	const getRecentlyPlayed = useGetGetRecentlyPlayed();
	const [recent, setRecent] = useState<Song[]>([]);
	const [loadingRecent, setLoadingRecent] = useState(true);
	const [initialized, setInitialized] = useState(false);
	const [initializedListLayout, setInitializedListLayout] = useState(false);
	const listSongLayoutVals = useSharedValue({
		top: 0,
		left: 0,
		height: INITIAL_SONGS_HEIGHT,
	});
	const layoutHeight = useSharedValue(0);
	const [listSongInitialLayout, setListSongInitialLayout] =
		useState<LayoutRectangle>();

	const animatedStyle = useAnimatedStyle(() => ({
		height: withTiming(listSongLayoutVals.value.height, {
			duration: 300,
			easing: Easing.linear,
		}),
		top: withTiming(listSongLayoutVals.value.top, {
			duration: 300,
			easing: Easing.linear,
		}),
		left: withTiming(listSongLayoutVals.value.left, {
			duration: 300,
			easing: Easing.linear,
		}),
	}));

	useState(() => {
		if (!initialized) {
			setInitialized(true);
			getRecentlyPlayed().then((recentSongs) => {
				setRecent(recentSongs);
				setLoadingRecent(false);
			});
		}
	});

	useEffect(() => {
		if (listSongInitialLayout) {
			if (search) {
				listSongLayoutVals.value = {
					height: layoutHeight.value,
					top: 16,
					left: 0,
				};
			} else {
				listSongLayoutVals.value = {
					height: INITIAL_SONGS_HEIGHT,
					top: listSongInitialLayout.y + listSongInitialLayout.height,
					left: listSongInitialLayout.x,
				};
			}
		}
	}, [listSongInitialLayout, listSongLayoutVals, layoutHeight, search]);

	const handleOnLayout = (e: LayoutChangeEvent) => {
		layoutHeight.value = e.nativeEvent.layout.height;
	};

	const handleSongListLayout = (e: LayoutChangeEvent) => {
		if (!!e.nativeEvent.layout) {
			setListSongInitialLayout(e.nativeEvent.layout);
			listSongLayoutVals.value = {
				height: e.nativeEvent.layout.height,
				top: e.nativeEvent.layout.y,
				left: e.nativeEvent.layout.x,
			};
			setInitializedListLayout(true);
		}
	};

	console.log({isLoading, songs: songs.length, initializedListLayout});
	const showLoading = isLoading || songs.length === 0 || !initializedListLayout;

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

	console.log({ showLoading });
	return (
		<YStack flex={1} gap="$2" onLayout={handleOnLayout} h="100%">
			<Heading />
			<YStack gap="$4">
				{!loadingRecent && !!recent.length && (
					<YStack p="$4" gap="$4">
						<H2>
							<Trans>Recently played</Trans>
						</H2>
						<FlashList
							data={recent}
							horizontal
							keyExtractor={(song) => song.id}
							renderItem={({ item }) => <SongBlockItem song={item} />}
							ItemSeparatorComponent={() => <View w={12} />}
							estimatedItemSize={150}
						/>
					</YStack>
				)}

				<View onLayout={handleSongListLayout}>
					<H2 paddingHorizontal="$4" paddingBottom="$4">
						<Trans>Last songs</Trans>
					</H2>
				</View>
				{showLoading && Loading}
				{!showLoading && (
					<Animated.View
						style={[
							animatedStyle,
							{
								width: "100%",
								position: "absolute",
								backgroundColor: tamaguiConfig.tokens.color.background.val,
							},
						]}
					>
						<FlashList
							data={songs}
							keyExtractor={(song) => song.id}
							renderItem={({ item }) => (
								<SongItem song={item} origin="latest" />
							)}
							ItemSeparatorComponent={() => <View h={18} />}
							estimatedItemSize={50}
							ListFooterComponent={<View style={{ height: 40 }} />}
							showsVerticalScrollIndicator={true}
							estimatedListSize={{
								width,
								height: INITIAL_SONGS_HEIGHT,
							}}
							onEndReachedThreshold={0.5}
							onEndReached={() => {
								refreshSongs();
							}}
						/>
					</Animated.View>
				)}
			</YStack>
			<Player />
		</YStack>
	);
}
