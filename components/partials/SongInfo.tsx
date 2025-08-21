import { useGetArtistAlbumBySong } from "@/hooks/useGetArtistAlbumBySong";
import { useGetSelectedSong, useGetSetSelectedSong } from "@/store/appStore";
import { useGetSetPlayingSongId, useGetToggleFavorite } from "@/store/songsStore";
import {
	useGetIsPausedSong,
	useGetPlayingSong,
	useGetPlaySong,
	useGetStopSong,
} from "@/store/usePlayerStore";
import { Trans, useLingui } from "@lingui/react/macro";
import { useEffect, useState } from "react";
import { Separator, Sheet, styled, XStack, YStack } from "tamagui";
import EditIcon from "../icons/EditIcon";
import FavoriteIcon from "../icons/FavoriteIcon";
import PauseIcon from "../icons/PauseIcon";
import PlayIcon from "../icons/PlayIcon";
import PlaylistAddIcon from "../icons/PlaylistAddIcon";
import TrashIcon from "../icons/TrashIcon";
import { ActionItem } from "../ui/ActionItem";
import { Text } from "../ui/Text";
import Cover from "./Cover";

export const Label = styled(Text, {
	fontSize: "$6",
	fontWeight: "$1",
	color: "$color.tertiary",
	letterSpacing: "$8",
	w: "25%",
});

export const Value = styled(Text, {
	fontSize: "$6",
	fontWeight: "$2",
	w: "60%",
	maxWidth: "100%",
});

const SongInfo: React.FC = () => {
	const { t } = useLingui();

	const song = useGetSelectedSong();
	const toggleFavorite = useGetToggleFavorite();

	const setPlayingSongId = useGetSetPlayingSongId();
	const { artist, album } = useGetArtistAlbumBySong(song);
	const setSelectedSong = useGetSetSelectedSong();
	const isPaused = useGetIsPausedSong();
	const playingSong = useGetPlayingSong();
	const play = useGetPlaySong();
	const stop = useGetStopSong();

	const open = !!song;
	const isPlayingSong = !isPaused && song?.id === playingSong?.id;

	const [isFavorite, setIsFavorite] = useState(!!song?.isFavorite);

	useEffect(() => {
		if (song) {
			setIsFavorite(song.isFavorite);
		}
	}, [song]);

	return (
		<Sheet
			forceRemoveScrollEnabled={open}
			modal={true}
			open={open}
			onOpenChange={() => setSelectedSong(undefined)}
			snapPointsMode={"fit"}
			dismissOnSnapToBottom
			zIndex={100_000}
			animation="medium"
		>
			<Sheet.Overlay
				animation="lazy"
				enterStyle={{ opacity: 0 }}
				exitStyle={{ opacity: 0, }}
				bg="$color.backgroundDarkTransparent40"
			/>

			<Sheet.Frame
				padding="$4"
				justifyContent="center"
				alignItems="center"
				backgroundColor="$color.primar"
				alignSelf="center"
			>
				<YStack gap="$4" maxWidth="100%">
					<XStack gap="$4" maxWidth="100%">
						<Cover coverPath={song?.coverPath || ""} />
						<XStack flexWrap="wrap" gap={0} maxWidth="90%">
							<Label>
								<Trans>Title</Trans>
							</Label>
							<Value>{song?.title}</Value>
							<Label>
								<Trans>Artist</Trans>
							</Label>
							<Value>{artist?.name}</Value>
							<Label>
								<Trans>Album</Trans>
							</Label>
							<Value>{album?.title}</Value>
						</XStack>
					</XStack>
					<YStack gap="$2">
						<ActionItem
							icon={
								isPlayingSong ? (
									<PauseIcon color="white" size={18} />
								) : (
									<PlayIcon color="white" size={18} />
								)
							}
							title={
								<Text>{isPlayingSong ? t`Pause song` : t`Play song`}</Text>
							}
							onPress={() => {
								if (isPlayingSong) {
									stop();
									setPlayingSongId(undefined);
								} else if (song) {
									play(song);
									setPlayingSongId(song.id);
								}
							}}
						/>
						<ActionItem
							icon={
								<FavoriteIcon color="white" filled={isFavorite} size={18} />
							}
							title={
								<Text>
									{isFavorite ? t`Remove from favorites` : t`Add to favorites`}
								</Text>
							}
							onPress={() => {
								toggleFavorite(song?.id || "");
								setIsFavorite(!isFavorite);
							}}
						/>
						<ActionItem
							icon={<PlaylistAddIcon color="white" size={18} />}
							title={<Text>{t`Add to playlist`}</Text>}
							onPress={() => {}}
						/>
						<Separator borderColor="$color.backgroundTransparent02" />
						<ActionItem
							icon={<EditIcon color="white" size={18} />}
							title={<Text>{t`Edit details`}</Text>}
							onPress={() => {}}
						/>
						<ActionItem
							bg="$red9Light"
							icon={<TrashIcon color="white" size={18} />}
							title={<Text>{t`Delete song`}</Text>}
							onPress={() => {}}
						/>
					</YStack>
				</YStack>
			</Sheet.Frame>
		</Sheet>
	);
};

export default SongInfo;
