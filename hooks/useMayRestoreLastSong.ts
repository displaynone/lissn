import { database } from "@/database";
import { Settings } from "@/models";
import { SETTINGS_KEYS } from "@/models/Settings";
import { useGetSongById } from "@/store/songsStore";
import { useGetSeekToSong, useGetSetSong, useGetUpdateProgress } from "@/store/usePlayerStore";
import { Q } from "@nozbe/watermelondb";
import { AudioStatus } from "expo-audio";

const useMayRestoreLastSong = () => {
	const updateProgressNotification = useGetUpdateProgress();
	const getSongById = useGetSongById();
	const seekTo = useGetSeekToSong();
  const setSong = useGetSetSong();

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
			const song = await getSongById(lastPlayedSong[0].value);
      if (song) {
        await setSong(song);
      }
		}
		return true;
	};

	return mayRestoreLastSong;
};

export default useMayRestoreLastSong;
