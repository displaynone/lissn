import { useGetArtistBySong } from "@/hooks/useGetArtistBySong";
import { Song } from "@/models";
import { useMusicStore } from "@/store/songsStore";
import { formatSeconds } from "@/utils/formatSeconds";
import { useState } from "react";
import { Text, XStack, YStack } from "tamagui";
import { Loading } from "../ui/Loading";
import Cover from "./Cover";

type SongItemProps = {
	song: Song;
};

const SongItem: React.FC<SongItemProps> = ({ song }) => {
	const {artist, isLoading} = useGetArtistBySong(song);
	const setPlayingSongId = useMusicStore((state) => state.setPlayingSongId);
	const [isPlaying, setIsPlaying] = useState(false);

	const handlePlay = async () => {
		if (isPlaying) {
			setIsPlaying(false);
			setPlayingSongId(undefined);
		} else {
			setIsPlaying(true);
			setPlayingSongId(song.id);
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
			backgroundColor={"$backgroundTransparent02"}
			padding="$3"
			borderRadius="$3"
		>
			{!!song.coverPath && <Cover coverPath={song.coverPath} size={52} />}
			<YStack gap="$1" flex={1}>
				<Text
					fontFamily="$inter"
					fontWeight={"200"}
					fontSize={"$6"}
					numberOfLines={1}
					ellipsizeMode="tail"
				>
					{song.title} {isPlaying ? "▶️" : "⏸️"}
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
