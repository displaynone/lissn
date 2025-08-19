import { Song } from "@/models";
import { ToastData } from "@/utils/types";
import { create } from "zustand";

interface AppState {
	songsListScrollPosition: number;
	songsFavoriteListScrollPosition: number;
	songDetailPageLoaded: boolean;
	showDrawer: boolean;
	seletedSong?: Song;
	toastData?: ToastData;

	setSongsListScrollPosition: (position: number) => void;
	setSongsFavoriteListScrollPosition: (position: number) => void;
	setSongDetailPageLoaded: (loaded: boolean) => void;
	setShowDrawer: (show: boolean) => void;
	setSelectedSong: (song?: Song) => void;
	setToastData: (data?: ToastData) => void;
}

export const useApp = create<AppState>((set, get) => ({
	songsListScrollPosition: 0,
	songsFavoriteListScrollPosition: 0,
	songDetailPageLoaded: false,
	showDrawer: false,
	selectedSong: undefined,
	toastData: undefined,

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
		set({ showDrawer: show });
	},
	setSelectedSong: (song) => {
		set({ seletedSong: song });
	},
	setToastData: (data) => {
		set({ toastData: data });
		setTimeout(() => {
			set({ toastData: undefined });
		}, (data?.duration || 3000) + 1000); // +1s for animation
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
export const useGetSelectedSong = () => useApp((state) => state.seletedSong);
export const useGetSetSelectedSong = () => useApp((state) => state.setSelectedSong);
export const useGetToastData = () => useApp((state) => state.toastData);
export const useGetSetToastData = () => useApp((state) => state.setToastData);
export const setToastData = (data: any) => useApp.getState().setToastData(data);