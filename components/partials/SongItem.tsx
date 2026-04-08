import useGeneratePlayingNowList from "@/hooks/useGeneratePlayingNowList";
import { useGetArtistAlbumBySong } from "@/hooks/useGetArtistAlbumBySong";
import { Song } from "@/models";
import { useGetSetSelectedSong } from "@/store/appStore";
import { useGetSetPlayingSongId } from "@/store/songsStore";
import {
	useGetIsPausedSong,
	useGetPlayingSong,
	useGetPlaySong,
	useGetStopSong,
} from "@/store/usePlayerStore";
import { tamaguiConfig } from "@/tamagui.config";
import { formatSeconds } from "@/utils/formatSeconds";
import { PlaylistType } from "@/utils/types";
import { Button, View, XStack, YStack } from "tamagui";
import DotsVerticalIcon from "../icons/DotsVerticalIcon";
import { AutoMarquee } from "../ui/AutoMarquee";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import { Text } from "../ui/Text";
import { WaveformFakeVisualizer } from "../ui/WaveformFakeVisualizer";
import Cover from "./Cover";

type SongItemProps = {
	song: Song;
	origin?: PlaylistType;
};

const COVER_SIZE = 52;

const SongItem: React.FC<SongItemProps> = ({ song, origin = 'latest'}) => {
	const { artist, isLoading } = useGetArtistAlbumBySong(song);
	const setPlayingSongId = useGetSetPlayingSongId();
	const stop = useGetStopSong();
	const play = useGetPlaySong();
	const playingSongId = useGetPlayingSong();
	const isPaused = useGetIsPausedSong();
	const isPlaying = playingSongId?.id === song.id && !isPaused;
	const setSelectedSong = useGetSetSelectedSong();
	const {generatePlaylist} = useGeneratePlayingNowList();

	const handlePlay = async () => {
		if (isPlaying) {
			setPlayingSongId(undefined);
			stop();
		} else {
			await generatePlaylist(origin);
			setPlayingSongId(song.id);
			await play(song);
		}
	};

	if (isLoading) {
		return <LoadingSkeleton height={75} />;
	}

	return (
		<XStack
			gap="$4"
			onPress={handlePlay}
			marginHorizontal={"$4"}
			backgroundColor={"transparent"}
			borderRadius="$3"
		>
			<View position="relative">
				<Cover coverPath={song.coverPath || ""} size={COVER_SIZE} />
				{isPlaying && (
					<View
						ai="center"
						jc="center"
						pos={"absolute"}
						t={0}
						l={0}
						w={COVER_SIZE}
						h={COVER_SIZE}
						backgroundColor={"$backgroundDarkTransparent40"}
						borderRadius={8}
					>
						<WaveformFakeVisualizer isPlaying={true} />
					</View>
				)}
			</View>
			<YStack gap="$1" flex={1}>
				<AutoMarquee
					text={song.title}
					playing={isPlaying}
					textProps={{
						fontFamily: "$inter",
						fontWeight: isPlaying ? "500" : "200",
						fontSize: "$6",
						color: isPlaying ? "$color.primary" : "white",
					}}
				/>
				<Text
					fontFamily="$inter"
					fontWeight={"100"}
					fontSize={"$5"}
					textTransform="uppercase"
				>
					{artist?.name || "Unknown Artist"}
				</Text>
			</YStack>
			<XStack ai="center">
				<Text
					fontFamily="$inter"
					fontWeight={"$9"}
					fontSize={10}
					textTransform="uppercase"
					alignSelf="center"
				>
					{formatSeconds(song.duration || 0)}
				</Text>
				<Button p={0} transparent onPress={() => setSelectedSong(song)}>
					<DotsVerticalIcon
						color={tamaguiConfig.tokens.color.backgroundTransparent50.val}
						size={18}
					/>
				</Button>
			</XStack>
		</XStack>
	);
};

export default SongItem;
