import { database } from "@/database";
import { Song } from "@/models";
import { Settings, SETTINGS_KEYS } from "@/models/Settings";
import {
	startNotification,
	stopNotification,
	updateNotification,
	UpdateNotificationArgs,
	wireNotificationEvents,
} from "@/services/AudioNotificationService";
import { Q } from "@nozbe/watermelondb";
import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { create } from "zustand";
import { useMusicStore } from "./songsStore";

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

export const initPlayerNotificationBridge = () => {
	return wireNotificationEvents({
		onPlayPause: () => {
			usePlayerStore.getState().togglePause();
		},
		onNext: () => usePlayerStore.getState().playNextSong(),
		onPrev: () => usePlayerStore.getState().playPreviousSong(),
		onStop: () => usePlayerStore.getState().stop(),
		onSeekTo: (position: number) => {
			usePlayerStore.getState().seekTo(position);
		},
	});
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
		get().stop();

		const player = createAudioPlayer(song.sourceUri);
		player.play();
		player.addListener("playbackStatusUpdate", async (status) => {
			if (status.didJustFinish) {
				get().playNextSong();
			}
		});

		const artist = await useMusicStore.getState().getArtistById(song.artistId);

		startNotification(song, artist);

		set({ song, player, isPaused: false, isStopped: false });
		const meta: UpdateNotificationArgs = {
			title: song.title,
			largeIconPath: (song as any)?.coverPath ?? null,
			isPlaying: true,
		};
		updateNotification(meta);
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
	},

	togglePause: async () => {
		const { player, isPaused, song } = get();
		if (!player) return;

		const nextIsPaused = !isPaused;

		if (isPaused) {
			player.play();
		} else {
			player.pause();
		}

		set({ isPaused: nextIsPaused });

		updateNotification({
			title: song?.title ?? null,
			artist: (song as any)?.artist?.name ?? null,
			isPlaying: !nextIsPaused,
		});
	},

	stop: () => {
		const { player, forceStop } = get();
		if (player) {
			player.pause();
		}
		forceStop();
		stopNotification();
	},

	forceStop: () => {
		set({ player: null, song: null, isPaused: true });
	},

	seekTo: (time: number) => {
		const { player } = get();
		if (player) {
			player.seekTo(time);
		}
	},

	playNextSong: async () => {
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
		const { song, isPaused } = get();
		if (song && !isPaused) {
			updateNotification({
				currentTime,
				duration,
			});
		}
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
