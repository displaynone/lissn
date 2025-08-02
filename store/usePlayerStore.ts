import { Song } from "@/models";
import { AudioPlayer, createAudioPlayer } from "expo-audio";
import { create } from "zustand";

interface PlayerStore {
	song: Song | null;
	player: AudioPlayer | null;
	isPaused: boolean;
	playSong: (song: Song) => Promise<void>;
	togglePause: () => Promise<void>;
	stop: () => void;
	seekTo: (time: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	song: null,
	player: null,
	isPaused: true,

	playSong: async (song) => {
		get().stop();

		const player = createAudioPlayer(song.sourceUri);
		player.play();

		set({ song, player, isPaused: false });
	},

	togglePause: async () => {
		const { player, isPaused } = get();
		if (!player) return;

		if (isPaused) {
			await player.play();
		} else {
			await player.pause();
		}

		set({ isPaused: !isPaused });
	},

	stop: () => {
		const { player } = get();
		if (player) {
			player.pause();
		}
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
export const useGetPlayingSong = () => usePlayerStore((state) => state.song);
