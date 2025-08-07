import { create } from "zustand";

interface AppState {
	songsListScrollPosition: number;
	songDetailPageLoaded: boolean;

	setSongsListScrollPosition: (position: number) => void;
	setSongDetailPageLoaded: (loaded: boolean) => void;
}

export const useApp = create<AppState>((set, get) => ({
	songsListScrollPosition: 0,
	songDetailPageLoaded: false,

	setSongsListScrollPosition: (id) => {
		set({ songsListScrollPosition: id });
	},
	setSongDetailPageLoaded: (loaded) => {
		set({ songDetailPageLoaded: loaded });
	},
}));

export const useGetSongsListScrollPosition = () =>
	useApp((state) => state.songsListScrollPosition);
export const useGetSetSongsListScrollPosition = () => useApp((state) => state.setSongsListScrollPosition);
export const useGetSongDetailPageLoaded = () => useApp((state) => state.songDetailPageLoaded);
export const useGetSetSongDetailPageLoaded = () => useApp((state) => state.setSongDetailPageLoaded);