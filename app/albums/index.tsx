import Cover from "@/components/partials/Cover";
import Heading from "@/components/partials/Heading";
import Player from "@/components/partials/Player";
import { useGetAlbums, useGetSearch } from "@/store/songsStore";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { Text, View, YStack } from "tamagui";

const DEFAULT_COVER_SIZE = 42;

export default function AlbumScreen() {
	const router = useRouter();
	const albums = useGetAlbums();
	const search = useGetSearch();

	const [width, setWidth] = useState(DEFAULT_COVER_SIZE);

	const handleOnLayout = (e: LayoutChangeEvent) => {
		setWidth(e.nativeEvent.layout.width);
	};

	const selectedAlbums = useMemo(
		() =>
			albums.filter((item) =>
				search?.["albums"]
					? item.title.toLowerCase().includes(search?.["albums"].toLowerCase())
					: true
			),
		[albums, search]
	);

	return (
		<YStack flex={1} gap="$2" p="$4" onLayout={handleOnLayout}>
			<Heading />
			<FlashList
				data={selectedAlbums}
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
						onPress={() => router.push(`/albums/${item.id}`)}
					>
						<Cover coverPath={item.artworkUri || ""} size={width / 4} />
						<Text
							textAlign="center"
							fontWeight="$1"
							fontSize="$4"
							color="$color.tertiary"
						>
							{item.title}
						</Text>
					</YStack>
				)}
				ItemSeparatorComponent={() => <View w={12} h={12} />}
				estimatedItemSize={150}
			/>
			<Player />
		</YStack>
	);
}
