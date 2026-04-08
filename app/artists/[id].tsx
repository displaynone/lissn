import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import EditIcon from "@/components/icons/EditIcon";
import Player from "@/components/partials/Player";
import SongItem from "@/components/partials/SongItem";
import { H2 } from "@/components/ui/Headings";
import { Loading } from "@/components/ui/Loading";
import { Text } from "@/components/ui/Text";
import { Artist, Song } from "@/models";
import { useGetArtistById, useGetGetSongsByArtist } from "@/store/songsStore";
import { Trans } from "@lingui/react/macro";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, View, XStack, YStack } from "tamagui";

export default function PlaylistsScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const getArtistById = useGetArtistById();
	const getSongsByArtist = useGetGetSongsByArtist();
	const { height } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const [artist, setArtist] = useState<Artist | null>(null);
	const [songs, setSongs] = useState<Song[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (id) {
			getArtistById(id).then((fetchedArtist) => {
				setArtist(fetchedArtist);
				getSongsByArtist(id).then((fetchedSongs) => {
					setSongs(fetchedSongs);
					setLoading(false);
				});
			});
		}
	});

	if (loading) {
		return <Loading />;
	}

	if (!artist) {
		return (
			<Text>
				<Trans>No artist found</Trans>
			</Text>
		);
	}

	return (
		<>
			<View pos="absolute" p="$4">
				<Button
					circular
					bg="$backgroundDarkTransparent10"
					onPress={() => router.back()}
				>
					<ArrowLeftIcon color="white" size={24} />
				</Button>
			</View>
			<YStack
				flex={1}
				p="$2"
				gap="$4"
				paddingTop={height / 3 - insets.top - 44}
			>
				<XStack
					jc="space-between"
					ai="center"
					paddingHorizontal="$4"
					backgroundColor="$color.backgroundDarkTransparent40"
				>
					<Text fontFamily="$inter" fontWeight="800" fontSize="$7">
						{artist.name}
					</Text>
					<Button
						circular
						transparent
						onPress={() => router.push(`/artists/edit/${artist.id}`)}
					>
						<EditIcon color="white" size={18} />
					</Button>
				</XStack>
				<H2 paddingHorizontal="$4">
					<Trans>Songs</Trans>
				</H2>
				<FlashList
					data={songs}
					keyExtractor={(song) => song.id}
					renderItem={({ item }) => <SongItem song={item} />}
					ItemSeparatorComponent={() => <View h={12} />}
				/>
				<Player />
			</YStack>
		</>
	);
}
