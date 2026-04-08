import { database } from "@/database";
import { Settings } from "@/models";
import { SETTINGS_KEYS } from "@/models/Settings";
import { useGetSetPlayingSongId } from "@/store/songsStore";
import {
	useGetPlayingSong,
	useGetSeekToSong,
	useGetUpdateProgress,
} from "@/store/usePlayerStore";
import { Q } from "@nozbe/watermelondb";
import { AudioStatus } from "expo-audio";

type StoredPlaybackProgress = Pick<AudioStatus, "currentTime" | "duration"> & {
	songId?: string | null;
};

const useMayRestoreLastSong = () => {
	const updateProgressNotification = useGetUpdateProgress();
	const setPlayingSongId = useGetSetPlayingSongId();
	const seekTo = useGetSeekToSong();
	const playingSong = useGetPlayingSong();

	const mayRestoreLastSong = async () => {
		const lastPlayedAt = await database
			.get<Settings>("settings")
			.query([Q.where("key", SETTINGS_KEYS.LAST_PLAYED_AT), Q.take(1)])
			.fetch();
		const lastPlayedAtValue = lastPlayedAt[0]?.value;
		if (lastPlayedAtValue) {
			const { currentTime, duration, songId } = JSON.parse(
				lastPlayedAtValue
			) as StoredPlaybackProgress;
			const shouldRestoreCurrentSong =
				!!playingSong?.id && !!songId && playingSong.id === songId;

			if (shouldRestoreCurrentSong) {
				updateProgressNotification(currentTime, duration);
				seekTo(currentTime);
			}
		}

		const lastPlayedSong = await database
			.get<Settings>("settings")
			.query([Q.where("key", SETTINGS_KEYS.LAST_SONG_ID), Q.take(1)])
			.fetch();

		const lastPlayedSongId = lastPlayedSong[0]?.value;
		if (lastPlayedSongId) {
			setPlayingSongId(lastPlayedSongId);
		}
		return true;
	};

	return mayRestoreLastSong;
};

export default useMayRestoreLastSong;
