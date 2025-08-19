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
