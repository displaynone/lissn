import Heading from "@/components/partials/Heading";
import Player from "@/components/partials/Player";
import SongItem from "@/components/partials/SongItem";
import { Text } from "@/components/ui/Text";
import {
	useAreSongsLoading,
	useGetPlayingNowSongs,
	useGetPlaylists,
	useGetSetCurrentPlaylist,
	useRefreshPlayingNowSongs,
} from "@/store/songsStore";
import { tamaguiConfig } from "@/tamagui.config";
import { FlashList } from "@shopify/flash-list";
import { ComponentProps, useState } from "react";
import {
	ScrollView,
	SizableText,
	Spinner,
	styled,
	Tabs as TaTabs,
	View,
	YStack,
} from "tamagui";

const Tabs = styled(TaTabs, {
	borderRadius: 0,
	maxWidth: "100%",
});

const TabsList = styled(TaTabs.List, {
	borderRadius: 0,
});

const selectedStyle: Pick<ComponentProps<typeof TaTabs.Tab>, "style">["style"] =
	{
		borderBottomColor: tamaguiConfig.tokens.color.primary.val,
		borderBottomWidth: 2,
		borderBottomRightRadius: 0,
		borderBottomLeftRadius: 0,
		backgroundColor: "transparent",
		color: tamaguiConfig.tokens.color.primary.val,
	};

const notSelectedStyle: Pick<
	ComponentProps<typeof TaTabs.Tab>,
	"style"
>["style"] = {
		backgroundColor: tamaguiConfig.tokens.color.background.val,
};

const Tab = styled(TaTabs.Tab, {
	px: "$4",
	py: "$2",
	pressStyle: {
		backgroundColor: tamaguiConfig.tokens.color.backgroundDarkTransparent10.val,
	},
	style: {
		borderBottomColor: tamaguiConfig.tokens.color.background.val,
		borderBottomWidth: 2,
		borderRadius: 0,
	},
});

export default function PlaylistsScreen() {
	const playlists = useGetPlaylists();
	const [activeTab, setActiveTab] = useState(playlists?.[0]?.id);
	const playingNowSongs = useGetPlayingNowSongs();
	const refreshPlayingNowSongs = useRefreshPlayingNowSongs();
	const isLoading = useAreSongsLoading();
	const setCurrentPlaylist = useGetSetCurrentPlaylist();

	const Loading = (
		<YStack flex={1} justifyContent="center" alignItems="center">
			{isLoading && <Spinner size="large" color="$blue10" />}
			<Text mt="$4" color="$gray11">
				{isLoading ? "Loading songs..." : "No songs found"}
			</Text>
		</YStack>
	);

	if (!playlists) {
		return Loading;
	}

	return (
		<YStack flex={1} gap="$3">
			<Heading />
			<View marginHorizontal="$4">
				<Tabs defaultValue="tab1" width={400} onValueChange={setActiveTab}>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						w="100%"
					>
						<TabsList overflow="scroll">
							{playlists.map((playlist) => (
								<Tab
									key={playlist.id}
									value={playlist.id}
									style={
										playlist.id === activeTab ? selectedStyle : notSelectedStyle
									}
									onPress={() => {
										setCurrentPlaylist(playlist.name);
										refreshPlayingNowSongs();
									}}
								>
									<SizableText bg="transparent">
										{playlist.description}
									</SizableText>
								</Tab>
							))}
						</TabsList>
					</ScrollView>
				</Tabs>
			</View>
			{isLoading && Loading}
			{!isLoading && (
				<FlashList
					data={playingNowSongs}
					keyExtractor={(song) => song.id + playlists?.[0].id}
					renderItem={({ item }) => (
						<SongItem song={item} origin="playing_now" />
					)}
					ItemSeparatorComponent={() => <View h={18} />}
					ListFooterComponent={<View style={{ height: 40 }} />}
					showsVerticalScrollIndicator={true}
					onEndReachedThreshold={0.5}
					onEndReached={() => {
						refreshPlayingNowSongs();
					}}
				/>
			)}
			<Player />
		</YStack>
	);
}
