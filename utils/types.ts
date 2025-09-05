import { Href } from "expo-router";

export type IconProps = {
	size?: number;
	color?: string;
};

export type SongMeta = {
	title: string;
	artist?: { name?: string | null } | null;
	coverPath?: string | null;
};

export type ToastData = {
	id: string;
	title: string;
	message?: string;
	duration?: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SearchTypes = ["songs", "artists", "albums", "favorites"] as const;
export type SearchType = typeof SearchTypes[number];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PlaylistTypes = ['latest', 'playing_now'] as const;
export type PlaylistType = typeof PlaylistTypes[number] | Href;

