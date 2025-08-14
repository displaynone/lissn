import { create } from "zustand";

interface AppState {
	songsListScrollPosition: number;
	songsFavoriteListScrollPosition: number;
	songDetailPageLoaded: boolean;
	showDrawer: boolean;

	setSongsListScrollPosition: (position: number) => void;
	setSongsFavoriteListScrollPosition: (position: number) => void;
	setSongDetailPageLoaded: (loaded: boolean) => void;
	setShowDrawer: (show: boolean) => void;
}

export const useApp = create<AppState>((set, get) => ({
	songsListScrollPosition: 0,
	songsFavoriteListScrollPosition: 0,
	songDetailPageLoaded: false,
	showDrawer: false,

	setSongsListScrollPosition: (id) => {
		set({ songsListScrollPosition: id });
	},
	setSongsFavoriteListScrollPosition: (id) => {
		set({ songsFavoriteListScrollPosition: id });
	},
	setSongDetailPageLoaded: (loaded) => {
		set({ songDetailPageLoaded: loaded });
	},
	setShowDrawer: (show) => {
		set({showDrawer: show});
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
export const useGetShowDrawer = () => useApp((state) => state.showDrawer);
export const useGetSetShowDrawer = () => useApp((state) => state.setShowDrawer);
