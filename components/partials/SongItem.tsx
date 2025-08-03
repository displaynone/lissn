import { useGetArtistBySong } from "@/hooks/useGetArtistBySong";
import { Song } from "@/models";
import { useGetSetPlayingSongId } from "@/store/songsStore";
import { useGetIsPausedSong, useGetPlayingSong, useGetPlaySong, useGetStopSong } from "@/store/usePlayerStore";
import { formatSeconds } from "@/utils/formatSeconds";
import { Text, View, XStack, YStack } from "tamagui";
import { Loading } from "../ui/Loading";
import { WaveformFakeVisualizer } from "../ui/WaveformFakeVisualizer";
import Cover from "./Cover";

type SongItemProps = {
	song: Song;
};

const COVER_SIZE = 52;

const SongItem: React.FC<SongItemProps> = ({ song }) => {
	const { artist, isLoading } = useGetArtistBySong(song);
	const setPlayingSongId = useGetSetPlayingSongId();
	const stop = useGetStopSong();
	const play = useGetPlaySong();
	const playingSongId = useGetPlayingSong();
	const isPaused = useGetIsPausedSong();
	const isPlaying = playingSongId?.id === song.id && !isPaused;

	const handlePlay = async () => {
		if (isPlaying) {
			setPlayingSongId(undefined);
			stop();
		} else {
			setPlayingSongId(song.id);
			play(song);
		}
	};

	if (isLoading) {
		return <Loading />;
	}

	return (
		<XStack
			gap="$4"
			onPress={handlePlay}
			marginHorizontal={"$4"}
			backgroundColor={isPlaying ? "$backgroundTransparent10":"$backgroundTransparent02"}
			padding="$3"
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
					>
						<WaveformFakeVisualizer isPlaying={true} />
					</View>
				)}
			</View>
			<YStack gap="$1" flex={1}>
				<Text
					fontFamily="$inter"
					fontWeight={isPlaying ? "500" : "200"}
					fontSize={"$6"}
					numberOfLines={1}
					ellipsizeMode="tail"
					color={isPlaying ? "$color.primary" : "white"}
				>
					{song.title}
				</Text>
				<Text
					fontFamily="$inter"
					fontWeight={"100"}
					fontSize={"$5"}
					textTransform="uppercase"
				>
					{artist?.name || "Unknown Artist"}
				</Text>
			</YStack>
			<Text
				fontFamily="$inter"
				fontWeight={"400"}
				fontSize={"$5"}
				textTransform="uppercase"
				alignSelf="center"
			>
				{formatSeconds(song.duration || 0)}
			</Text>
		</XStack>
	);
};

export default SongItem;
