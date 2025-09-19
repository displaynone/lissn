import EditIcon from "@/components/icons/EditIcon";
import PlaylistAddIcon from "@/components/icons/PlaylistAddIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import Heading from "@/components/partials/Heading";
import SheetDialog from "@/components/partials/SheetDialog";
import { H2 } from "@/components/ui/Headings";
import { Text } from "@/components/ui/Text";
import { PLAYLIST_PLAYING_NOW_NAME } from "@/models/Playlist";
import { useGetDeletePlaylist, useGetPlaylists } from "@/store/songsStore";
import { tamaguiConfig } from "@/tamagui.config";
import { Trans } from "@lingui/react/macro";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Button, View, XStack, YStack } from "tamagui";

export default function EditPlaylistsScreen() {
	const allPlaylists = useGetPlaylists();
	const deletePlaylist = useGetDeletePlaylist();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [deleteId, setDeleteId] = useState<string>();

	const playlists = useMemo(() => {
		return allPlaylists.filter(
			(playlist) => playlist.name !== PLAYLIST_PLAYING_NOW_NAME
		);
	}, [allPlaylists]);

	return (
		<YStack flex={1} gap="$3">
			<Heading />
			<XStack jc="flex-end" paddingHorizontal="$4">
				<Button
					bg="$color.backgroundDarkTransparent20"
					onPress={() => router.push("/playlists/new")}
				>
					<PlaylistAddIcon color="white" /> <Text>Create new</Text>
				</Button>
			</XStack>
			<View p="$4" w="100%" h="100%">
				{!playlists.length && (
					<Text>
						<Trans>There are not playlists yet</Trans>
					</Text>
				)}
				<FlashList
					data={playlists}
					keyExtractor={(playlist) => playlist.id}
					renderItem={({ item }) => (
						<XStack jc="space-between" ai="center">
							<Text>{item.description}</Text>
							<XStack>
								<Button p="$2.5">
									<EditIcon color="white" />
								</Button>
								<Button
									p="$2.5"
									onPress={() => {
										setDeleteId(item.id);
										setOpen(true);
									}}
								>
									<TrashIcon color={tamaguiConfig.tokens.color.red9Light.val} />
								</Button>
							</XStack>
						</XStack>
					)}
					ItemSeparatorComponent={() => <View h={18} />}
					estimatedItemSize={50}
					ListFooterComponent={<View style={{ height: 40 }} />}
					showsVerticalScrollIndicator={true}
					onEndReachedThreshold={0.5}
				/>

				<SheetDialog open={open} onOpenChange={(val: boolean) => setOpen(val)}>
					<YStack gap="$3" p="$4">
						<H2>
							<Trans>Delete playlist</Trans>
						</H2>
					</YStack>
					<Text>Are you sure you want to delete the playlist?</Text>
					<XStack gap="$4" jc="flex-start" mt="$4">
						<Button
							bg="$red9Light"
							onPress={() => {
								deletePlaylist(deleteId || "");
							}}
							marginTop="$4"
							color="$color.white"
						>
							<Text>
								<Trans>Delete</Trans>
							</Text>
						</Button>
						<Button
							bg="$color.backgroundDarkTransparent20"
							onPress={() => setOpen(false)}
							marginTop="$4"
							color="$color.white"
						>
							<Text>
								<Trans>Cancel</Trans>
							</Text>
						</Button>
					</XStack>
				</SheetDialog>
			</View>
		</YStack>
	);
}
