import { create } from "zustand";

interface AppState {
	songsListScrollPosition: number;
	songsFavoriteListScrollPosition: number;
	songDetailPageLoaded: boolean;

	setSongsListScrollPosition: (position: number) => void;
	setSongsFavoriteListScrollPosition: (position: number) => void;
	setSongDetailPageLoaded: (loaded: boolean) => void;
}

export const useApp = create<AppState>((set, get) => ({
	songsListScrollPosition: 0,
	songsFavoriteListScrollPosition: 0,
	songDetailPageLoaded: false,

	setSongsListScrollPosition: (id) => {
		set({ songsListScrollPosition: id });
	},
	setSongsFavoriteListScrollPosition: (id) => {
		set({ songsFavoriteListScrollPosition: id });
	},
	setSongDetailPageLoaded: (loaded) => {
		set({ songDetailPageLoaded: loaded });
	},
}));

export const useGetSongsListScrollPosition = () =>
	useApp((state) => state.songsListScrollPosition);
export const useGetSongsFavoriteListScrollPosition = () =>
	useApp((state) => state.songsFavoriteListScrollPosition);
export const useGetSetSongsListScrollPosition = () =>
	useApp((state) => state.setSongsListScrollPosition);
export const useGetSetSongsFavoriteListScrollPosition = () =>
	useApp((state) => state.setSongsFavoriteListScrollPosition);
export const useGetSongDetailPageLoaded = () =>
	useApp((state) => state.songDetailPageLoaded);
export const useGetSetSongDetailPageLoaded = () =>
	useApp((state) => state.setSongDetailPageLoaded);
