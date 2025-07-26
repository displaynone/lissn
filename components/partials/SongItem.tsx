import { Artist, Song } from "@/models";
import { useMusicStore } from "@/store/songsStore";
import { formatSeconds } from "@/utils/formatSeconds";
import { useEffect, useState } from "react";
import FastImage from "react-native-fast-image";
import { Text, View, XStack, YStack } from "tamagui";
import MissingCoverIcon from "../icons/MissingCoverIcon";
import { Loading } from "../ui/Loading";

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
				<View style={{ width: 64, height: 64, borderRadius: 8 }}>
					<View
						style={{
							width: 64,
							height: 64,
							borderRadius: 8,
							position: "absolute",
							opacity: 0.2,
						}}
					>
						<MissingCoverIcon size={64} />
					</View>
					<FastImage
						style={{ width: 64, height: 64, borderRadius: 8 }}
						source={{
							uri: song.coverPath,
						}}
						resizeMode={FastImage.resizeMode.cover}
					/>
				</View>
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
