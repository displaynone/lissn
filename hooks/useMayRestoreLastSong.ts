import { database } from "@/database";
import { Settings } from "@/models";
import { SETTINGS_KEYS } from "@/models/Settings";
import { useGetSetPlayingSongId } from "@/store/songsStore";
import { useGetSeekToSong, useGetUpdateProgress } from "@/store/usePlayerStore";
import { Q } from "@nozbe/watermelondb";
import { AudioStatus } from "expo-audio";

const useMayRestoreLastSong = () => {
	const updateProgressNotification = useGetUpdateProgress();
	const setPlayingSongId = useGetSetPlayingSongId();
	const seekTo = useGetSeekToSong();

	const mayRestoreLastSong = async () => {
		const lastPlayedAt = await database
			.get<Settings>("settings")
			.query([Q.where("key", SETTINGS_KEYS.LAST_PLAYED_AT), Q.take(1)])
			.fetch();
		if (lastPlayedAt.length === 0 && lastPlayedAt[0].value) {
			const { currentTime, duration } = JSON.parse(
				lastPlayedAt[0].value
			) as Pick<AudioStatus, "currentTime" | "duration">;
			updateProgressNotification(currentTime, duration);
			seekTo(currentTime);
		}

		const lastPlayedSong = await database
			.get<Settings>("settings")
			.query([Q.where("key", SETTINGS_KEYS.LAST_SONG_ID), Q.take(1)])
			.fetch();

		if (lastPlayedSong?.[0].value) {
			setPlayingSongId(lastPlayedSong[0].value);
		}
		return true;
	};

	return mayRestoreLastSong;
};

export default useMayRestoreLastSong;
