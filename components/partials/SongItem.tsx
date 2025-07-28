import { Artist, Song } from "@/models";
import { useMusicStore } from "@/store/songsStore";
import { formatSeconds } from "@/utils/formatSeconds";
import { useEffect, useState } from "react";
import { Text, XStack, YStack } from "tamagui";
import { Loading } from "../ui/Loading";
import Cover from "./Cover";

type SongItemProps = {
	song: Song;
};

const SongItem: React.FC<SongItemProps> = ({ song }) => {
	const getArtistById = useMusicStore((state) => state.getArtistById);
	const setPlayingSongId = useMusicStore((state) => state.setPlayingSongId);
	const [artist, setArtist] = useState<Artist | null>(null);
	const [loading, setLoading] = useState(true);
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		const fetchArtist = async () => {
			const fetchedArtist = await getArtistById(song.artistId);
			setArtist(fetchedArtist);
			setLoading(false);
		};
		fetchArtist();
	}, [getArtistById, song.artistId]);

	const handlePlay = async () => {
		if (isPlaying) {
			setIsPlaying(false);
			setPlayingSongId(undefined);
		} else {
			setIsPlaying(true);
			setPlayingSongId(song.id);
		}
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<XStack gap="$4" onPress={handlePlay}>
			{!!song.coverPath && (
				<Cover
					coverPath={song.coverPath}
				/>
			)}
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
				fontWeight={"100"}
				fontSize={"$5"}
				textTransform="uppercase"
			>
				{formatSeconds(song.duration || 0)}
			</Text>
		</XStack>
	);
};

export default SongItem;
