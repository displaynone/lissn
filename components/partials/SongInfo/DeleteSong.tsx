import { H2 } from "@/components/ui/Headings";
import { Text } from "@/components/ui/Text";
import { Song } from "@/models";
import { useGetSetSelectedSong } from "@/store/appStore";
import { useGetDeleteSong, useGetSetPlayingSongId } from "@/store/songsStore";
import { Trans } from "@lingui/react/macro";
import { Dispatch, FC, SetStateAction } from "react";
import { Button, XStack, YStack } from "tamagui";
import SheetDialog from "../SheetDialog";

type DeleteSongProps = {
	song?: Song;
	setDeleteDialogOpen: Dispatch<SetStateAction<boolean>>;
	deleteDialogOpen: boolean;
	isPlayingSong: boolean;
};

const DeleteSongDialog: FC<DeleteSongProps> = ({
	setDeleteDialogOpen,
	deleteDialogOpen,
	song,
	isPlayingSong,
}) => {
	const deleteSong = useGetDeleteSong();
	const setSelectedSong = useGetSetSelectedSong();
	const setPlayingSongId = useGetSetPlayingSongId();

	return (
		<SheetDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
			<YStack gap="$3" p="$4">
				<H2>
					<Trans>Hide song</Trans>
				</H2>
				<Text>
					<Trans>Are you sure you want to hide this song? It won’t be visible in your lists anymore.</Trans>
				</Text>
				<XStack gap="$4" jc="flex-start" mt="$4">
					<Button
						bg="$red9Light"
						onPress={() => {
							deleteSong(song?.id || "");
							setDeleteDialogOpen(false);
							setSelectedSong(undefined);
							if (isPlayingSong) {
								stop();
								setPlayingSongId(undefined);
							}
						}}
						marginTop="$4"
					>
						<Text>
							<Trans>Delete</Trans>
						</Text>
					</Button>
					<Button
						bg="$color.backgroundDarkTransparent20"
						onPress={() => setDeleteDialogOpen(false)}
						marginTop="$4"
						color="$color.white"
					>
						<Text>
							<Trans>Cancel</Trans>
						</Text>
					</Button>
				</XStack>
			</YStack>
		</SheetDialog>
	);
};

export default DeleteSongDialog;