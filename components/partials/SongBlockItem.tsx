import { useGetArtistBySong } from "@/hooks/useGetArtistBySong";
import { Song } from "@/models";
import { useGetSetPlayingSongId } from "@/store/songsStore";
import {
	useGetIsPausedSong,
	useGetPlayingSong,
	useGetPlaySong,
	useGetStopSong,
} from "@/store/usePlayerStore";
import { View, YStack } from "tamagui";
import { AutoMarquee } from "../ui/AutoMarquee";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import { WaveformFakeVisualizer } from "../ui/WaveformFakeVisualizer";
import Cover from "./Cover";

type SongItemProps = {
	song: Song;
};

const COVER_SIZE = 124;

const SongBlockItem: React.FC<SongItemProps> = ({ song }) => {
	const { isLoading } = useGetArtistBySong(song);
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
		return <LoadingSkeleton height={75} />;
	}

	return (
		<YStack gap="$2" onPress={handlePlay} borderRadius="$3" w={COVER_SIZE}>
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
						<WaveformFakeVisualizer
							isPlaying={true}
							barHeight={COVER_SIZE / 3}
							barWidth={COVER_SIZE / 9}
						/>
					</View>
				)}
			</View>
			<AutoMarquee
				text={song.title}
				playing={isPlaying}
				textProps={{
					fontFamily: "$inter",
					fontWeight: isPlaying ? "500" : "200",
					fontSize: 10,
					textAlign: "center",
					color: isPlaying ? "$color.primary" : "white",
				}}
			/>
		</YStack>
	);
};

export default SongBlockItem;
