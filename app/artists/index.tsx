import Cover from "@/components/partials/Cover";
import Heading from "@/components/partials/Heading";
import Player from "@/components/partials/Player";
import { useGetArtists, useGetSearch } from "@/store/songsStore";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { Text, View, YStack } from "tamagui";

const DEFAULT_COVER_SIZE = 42;

export default function ArtistsScreen() {
	const router = useRouter();
	const artists = useGetArtists();
	const search = useGetSearch();
	const [width, setWidth] = useState(DEFAULT_COVER_SIZE);

	const handleOnLayout = (e: LayoutChangeEvent) => {
		setWidth(e.nativeEvent.layout.width);
	};

	const selectedArtists = useMemo(
		() =>
			artists.filter((item) =>
				search?.["artists"]
					? item.name.toLowerCase().includes(search?.["artists"].toLowerCase())
					: true
			),
		[artists, search]
	);

	return (
		<YStack flex={1} gap="$2" p="$4" onLayout={handleOnLayout}>
			<Heading />
			<FlashList
				data={selectedArtists}
				numColumns={3}
				keyExtractor={(song) => song.id}
				renderItem={({ item }) => (
					<YStack
						key={item.id}
						ai="center"
						gap="$2"
						minWidth="100%"
						minHeight="100%"
						paddingBottom="$2"
						onPress={() => router.push(`/artists/${item.id}`)}
					>
						<Cover coverPath={item.artworkUri || ""} size={width / 4} />
						<Text
							textAlign="center"
							fontWeight="$1"
							fontSize="$4"
							color="$color.tertiary"
						>
							{item.name}
						</Text>
					</YStack>
				)}
				ItemSeparatorComponent={() => <View w={12} h={12} />}
			/>
			<Player />
		</YStack>
	);
}
