import { H2 } from "@/components/ui/Headings";
import Select from "@/components/ui/Select";
import { Text } from "@/components/ui/Text";
import { Song } from "@/models";
import { PLAYLIST_PLAYING_NOW_NAME } from "@/models/Playlist";
import { useGetSetToastData } from "@/store/appStore";
import { useGetCreatePlaylistSong, useGetPlaylists } from "@/store/songsStore";
import { Trans, useLingui } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { FC, useMemo, useState } from "react";
import { Button, YStack } from "tamagui";
import SheetDialog from "../SheetDialog";

type AddSongPlaylistProps = {
	song: Song;
	setAddSongDialogOpen: (val: boolean) => void;
	addSongDialogOpen: boolean;
};

const AddSongPlaylist: FC<AddSongPlaylistProps> = ({
	song,
	setAddSongDialogOpen,
	addSongDialogOpen,
}) => {
	const { t } = useLingui();
	const router = useRouter();
	const playlists = useGetPlaylists();
	const createPlaylistSong = useGetCreatePlaylistSong();
	const [playlistId, setPlaylistId] = useState("");
	const setToastData = useGetSetToastData();

	const filteredPlaylist = useMemo(
		() => playlists.filter((list) => list.name !== PLAYLIST_PLAYING_NOW_NAME),
		[playlists]
	);

	return (
		<SheetDialog open={addSongDialogOpen} onOpenChange={setAddSongDialogOpen}>
			<YStack gap="$3" p="$4" w="100%">
				<H2>
					<Trans>Add song to playlist</Trans>
				</H2>
				{!!filteredPlaylist.length && (
					<Text>
						<Trans>
							Select a playlist or create a new one to add this song.
						</Trans>
					</Text>
				)}
				<YStack gap="$4" jc="flex-start" mt="$4" paddingBottom="$4">
					{!!filteredPlaylist.length && (
						<>
							<Select
								id="artistId"
								items={filteredPlaylist}
								value={playlistId}
								onValueChange={(val) => {
									setPlaylistId(val);
								}}
								getId={(item) => item.id}
								getDescription={(item) => item.description}
							/>
							<Button
								onPress={() => {
									createPlaylistSong(playlistId, song.id);
									setAddSongDialogOpen(false);
									setToastData({
										id: "merge_artists",
										title: t`Playlist`,
										message: t`The song have been added successfully`,
										duration: 3000,
									});
								}}
								bg="$color.color"
							>
								<Text>
									<Trans>Add</Trans>
								</Text>
							</Button>
						</>
					)}
					<Text><Trans>Add new playlist</Trans></Text>
					<Button
						onPress={() => {
							setAddSongDialogOpen(false);
							router.push("/playlists/new");
						}}
						bg="$color.backgroundDarkTransparent20"
					>
						<Text>
							<Trans>Create playlist</Trans>
						</Text>
					</Button>
				</YStack>
			</YStack>
		</SheetDialog>
	);
};

export default AddSongPlaylist;
