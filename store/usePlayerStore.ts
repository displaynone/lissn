import { Song } from "@/models";
import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { create } from "zustand";

interface PlayerStore {
	song: Song | null;
	player: AudioPlayer | null;
	isPaused: boolean;
	isStopped: boolean;
	playSong: (song: Song) => Promise<void>;
	togglePause: () => Promise<void>;
	stop: () => void;
	forceStop: () => void;
	seekTo: (time: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	song: null,
	player: null,
	isPaused: true,
	isStopped: false,

	playSong: async (song) => {
		console.trace("playSong");
		get().stop();

		const player = createAudioPlayer(song.sourceUri);
		player.play();
		player.addListener("playbackStatusUpdate", (status) => {
			if (status.didJustFinish) {
				get().forceStop();
				set({ isStopped: true });
			}
		});
		set({ song, player, isPaused: false, isStopped: false });
	},

	togglePause: async () => {
		const { player, isPaused } = get();
		if (!player) return;

		if (isPaused) {
			player.play();
		} else {
			player.pause();
		}

		set({ isPaused: !isPaused });
	},

	stop: () => {
		const { player, forceStop } = get();
		if (player) {
			player.pause();
		}
		forceStop();
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
}));

export const useGetPlayer = () => usePlayerStore((state) => state.player);
export const useGetPlaySong = () => usePlayerStore((state) => state.playSong);
export const useGetTooglePauseSong = () =>
	usePlayerStore((state) => state.togglePause);
export const useGetStopSong = () => usePlayerStore((state) => state.stop);
export const useGetSeekToSong = () => usePlayerStore((state) => state.seekTo);
export const useGetIsPausedSong = () =>
	usePlayerStore((state) => state.isPaused);
export const useGetIsStoppedSong = () =>
	usePlayerStore((state) => state.isStopped);
export const useGetPlayingSong = () => usePlayerStore((state) => state.song);
