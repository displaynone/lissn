import { create } from "zustand";

interface AppState {
	songsListScrollPosition: number;

	setSongsListScrollPosition: (position: number) => void;
}

export const useApp = create<AppState>((set, get) => ({
	songsListScrollPosition: 0,

	setSongsListScrollPosition: (id) => {
		set({ songsListScrollPosition: id });
	},
}));

export const useGetSongsListScrollPosition = () =>
	useApp((state) => state.songsListScrollPosition);
export const useGetSetSongsListScrollPosition = () => useApp((state) => state.setSongsListScrollPosition);