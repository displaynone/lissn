import { database } from "@/database";
import { Song } from "@/models";
import { Settings, SETTINGS_KEYS } from "@/models/Settings";
import { Q } from "@nozbe/watermelondb";
import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { create } from "zustand";
import { useMusicStore } from "./songsStore";

const getLockScreenArtworkUrl = (coverPath?: string | null) => {
	if (!coverPath) return undefined;
	if (coverPath.startsWith("http://") || coverPath.startsWith("https://")) {
		return coverPath;
	}
	return undefined;
};

interface PlayerStore {
	song: Song | null;
	player: AudioPlayer | null;
	isPaused: boolean;
	isStopped: boolean;

	setSong: (song: Song) => Promise<void>;
	playSong: (song: Song) => Promise<void>;
	togglePause: () => Promise<void>;
	stop: () => void;
	forceStop: () => void;
	seekTo: (time: number) => void;
	playNextSong: () => void;
	playPreviousSong: () => void;
	updateProgress: (currentTime: number, duration: number) => void;
}

const releasePlayer = (player: AudioPlayer | null) => {
	if (!player) return;

	player.pause();
	player.clearLockScreenControls();
	player.remove();
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	song: null,
	player: null,
	isPaused: true,
	isStopped: false,

	setSong: async (song) => {
		set({ song });
	},

	playSong: async (song) => {
		const currentPlayer = get().player;
		set({ player: null, isPaused: true });
		releasePlayer(currentPlayer);

		const player = createAudioPlayer(song.sourceUri);
		let finishHandled = false;

		player.addListener("playbackStatusUpdate", async (status) => {
			if (get().player?.id !== player.id) {
				return;
			}

			set({
				isPaused: !status.playing,
				isStopped: false,
			});

			if (status.didJustFinish) {
				if (finishHandled) {
					return;
				}
				finishHandled = true;
				await get().playNextSong();
			}
		});

		set({ song, player, isPaused: false, isStopped: false });

		const artist = await useMusicStore.getState().getArtistById(song.artistId);
		player.setActiveForLockScreen(
			true,
			{
				title: song.title,
				artist: artist?.name ?? "",
				artworkUrl: getLockScreenArtworkUrl(song.coverPath),
			},
			{
				showSeekBackward: true,
				showSeekForward: true,
			}
		);
		player.play();

		await song.incrementPlayCount();

		const lastPlayedAt = await database
			.get<Settings>("settings")
			.query([Q.where("key", SETTINGS_KEYS.LAST_SONG_ID), Q.take(1)])
			.fetch();
		if (lastPlayedAt.length > 0) {
			await database.write(async () => {
				await lastPlayedAt[0].update((setting) => {
					setting.value = song.id;
				});
			});
		} else {
			await database.write(async () => {
				await database.get<Settings>("settings").create((setting) => {
					setting.key = SETTINGS_KEYS.LAST_SONG_ID;
					setting.value = song.id;
				});
			});
		}

		const lastPlayedProgress = await database
			.get<Settings>("settings")
			.query([Q.where("key", SETTINGS_KEYS.LAST_PLAYED_AT), Q.take(1)])
			.fetch();
		const nextProgressValue = JSON.stringify({
			songId: song.id,
			currentTime: 0,
			duration: song.duration ?? 0,
		});

		if (lastPlayedProgress.length > 0) {
			await database.write(async () => {
				await lastPlayedProgress[0].update((setting) => {
					setting.value = nextProgressValue;
				});
			});
		} else {
			await database.write(async () => {
				await database.get<Settings>("settings").create((setting) => {
					setting.key = SETTINGS_KEYS.LAST_PLAYED_AT;
					setting.value = nextProgressValue;
				});
			});
		}
	},

	togglePause: async () => {
		const { player, isPaused } = get();
		if (!player) return;

		const nextIsPaused = !isPaused;

		if (isPaused) {
			player.play();
		} else {
			player.pause();
		}

		set({ isPaused: nextIsPaused });
	},

	stop: () => {
		releasePlayer(get().player);
		get().forceStop();
	},

	forceStop: () => {
		set({ player: null, song: null, isPaused: true, isStopped: true });
	},

	seekTo: (time: number) => {
		const { player } = get();
		if (player) {
			player.seekTo(time);
		}
	},

	playNextSong: async () => {
		if (!get().player) return;

		const currentSongId = get().song?.id;
		if (!currentSongId) return;

		const nextSong = await useMusicStore
			.getState()
			.getNextSongById(currentSongId);

		if (nextSong) {
			await get().playSong(nextSong);
			useMusicStore.getState().setPlayingSongId(nextSong.id);
		} else {
			get().stop();
			set({ isStopped: true });
		}
	},

	playPreviousSong: async () => {
		if (!get().player) return;

		const currentSongId = get().song?.id;
		if (!currentSongId) return;

		const previousSong = await useMusicStore
			.getState()
			.getPreviousSongById(currentSongId);

		if (previousSong) {
			await get().playSong(previousSong);
			useMusicStore.getState().setPlayingSongId(previousSong.id);
		} else {
			get().stop();
			set({ isStopped: true });
		}
	},

	updateProgress: (currentTime: number, duration: number) => {
		void currentTime;
		void duration;
	},
}));

export const useGetPlayer = () => usePlayerStore((state) => state.player);
export const useGetPlaySong = () => usePlayerStore((state) => state.playSong);
export const useGetTogglePauseSong = () =>
	usePlayerStore((state) => state.togglePause);
export const useGetStopSong = () => usePlayerStore((state) => state.stop);
export const useGetSeekToSong = () => usePlayerStore((state) => state.seekTo);
export const useGetIsPausedSong = () =>
	usePlayerStore((state) => state.isPaused);
export const useGetIsStoppedSong = () =>
	usePlayerStore((state) => state.isStopped);
export const useGetPlayingSong = () => usePlayerStore((state) => state.song);
export const useGetPlayNextSong = () =>
	usePlayerStore((state) => state.playNextSong);
export const useGetPlayPreviousSong = () =>
	usePlayerStore((state) => state.playPreviousSong);
export const useGetUpdateProgress = () =>
	usePlayerStore((state) => state.updateProgress);
export const useGetSetSong = () =>
	usePlayerStore((state) => state.setSong);
