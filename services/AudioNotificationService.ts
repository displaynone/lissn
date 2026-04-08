import { Artist } from "@/models";
import {
	DeviceEventEmitter,
	EmitterSubscription,
	NativeModules,
	PermissionsAndroid,
	Platform,
} from "react-native";

export interface Song {
	title: string;
	artist?: { name?: string | null } | null;
}

type AudioNotificationModuleType = {
	startService: (
		title: string,
		artist: string,
		smallIconName?: string | null,
		largeIconPath?: string | null,
		isPlaying?: boolean
	) => Promise<void> | void;
	update: (
		title?: string | null,
		artist?: string | null,
		smallIconName?: string | null,
		largeIconPath?: string | null,
		isPlaying?: boolean | null
	) => Promise<void> | void;
	updateProgress: (
		currentTime: number,
		duration: number
	) => Promise<void> | void;
	updateWithProgress: (
		title?: string | null,
		artist?: string | null,
		smallIconName?: string | null,
		largeIconPath?: string | null,
		isPlaying?: boolean | null,
		currentTime?: number | null,
		duration?: number | null
	) => Promise<void> | void;
	stop: () => Promise<void> | void;
	notifyReactNativeReady: () => Promise<void> | void;
};

function getAudioNotificationModule(): AudioNotificationModuleType | null {
	const { AudioNotificationModule } = NativeModules as {
		AudioNotificationModule?: AudioNotificationModuleType;
	};

	if (!AudioNotificationModule) {
		if (Platform.OS === "web") {
			return null;
		}

		throw new Error(
			`AudioNotificationModule is not available on ${Platform.OS}. Make sure the native module is installed and the app was rebuilt.`
		);
	}

	return AudioNotificationModule;
}

export async function ensureNotificationPermission(): Promise<boolean> {
	if (Platform.OS === "android" && Platform.Version >= 33) {
		const res = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
		);
		return res === PermissionsAndroid.RESULTS.GRANTED;
	}
	return true;
}

type StartNotificationOptions = {
	smallIconName?: string | null;
	largeIconPath?: string | null;
	isPlaying?: boolean;
};

export async function startNotification(
	song: Song,
	artist: Artist | null,
	opts: StartNotificationOptions = {}
): Promise<void> {
	const {
		smallIconName = "ic_music_note",
		largeIconPath = null,
		isPlaying = true,
	} = opts;
	await ensureNotificationPermission();
	const module = getAudioNotificationModule();
	if (!module) return;

	await module.startService(
		song.title,
		artist?.name ?? "",
		smallIconName,
		largeIconPath,
		isPlaying
	);
}

export type UpdateNotificationArgs = {
	title?: string | null;
	artist?: string | null;
	isPlaying?: boolean;
	largeIconPath?: string | null;
	smallIconName?: string | null;
	currentTime?: number | null;
	duration?: number | null;
};

export function updateNotification(args: UpdateNotificationArgs): void {
	const {
		title = null,
		artist = null,
		isPlaying,
		largeIconPath = null,
		smallIconName = null,
		currentTime = null,
		duration = null,
	} = args;
	const module = getAudioNotificationModule();
	if (!module) return;

	if (currentTime !== null || duration !== null) {
		module.updateWithProgress(
			title,
			artist,
			smallIconName,
			largeIconPath,
			typeof isPlaying === "boolean" ? isPlaying : null,
			currentTime,
			duration
		);
	} else {
		module.update(
			title,
			artist,
			smallIconName,
			largeIconPath,
			typeof isPlaying === "boolean" ? isPlaying : null
		);
	}
}

export function updateNotificationProgress(currentTime: number, duration: number): void {
	const module = getAudioNotificationModule();
	if (!module) return;
	module.updateProgress(currentTime, duration);
}

export function stopNotification(): void {
	const module = getAudioNotificationModule();
	if (!module) return;
	module.stop();
}

type WireNotificationEventsArgs = {
	onPlayPause?: () => void;
	onNext?: () => void;
	onPrev?: () => void;
	onStop?: () => void;
	onSeekTo?: (position: number) => void;
};

export function wireNotificationEvents({
	onPlayPause,
	onNext,
	onPrev,
	onStop,
	onSeekTo,
}: WireNotificationEventsArgs): () => void {
	const subs: EmitterSubscription[] = [];

	if (onPlayPause) {
    subs.push(
      DeviceEventEmitter.addListener("audio-notif-play-pause", (data) => {
        onPlayPause();
      })
		);
	}
	if (onNext) {
		subs.push(DeviceEventEmitter.addListener("audio-notif-next", (data) => {
      onNext();
    }));
	}
	if (onPrev) {
		subs.push(DeviceEventEmitter.addListener("audio-notif-prev", (data) => {
      onPrev();
    }));
	}
	if (onStop) {
		subs.push(DeviceEventEmitter.addListener("audio-notif-stop", (data) => {
      onStop();
    }));
	}
	if (onSeekTo) {
		subs.push(DeviceEventEmitter.addListener("audio-notif-seek-to", (data) => {
      const position = data?.position || 0;
      onSeekTo(position);
    }));
	}

	setTimeout(() => {
		const module = getAudioNotificationModule();
		if (!module) return;
		module.notifyReactNativeReady();
	}, 100);

	return () => subs.forEach((s) => s.remove());
}

export function notifyReactNativeReady(): void {
	const module = getAudioNotificationModule();
	if (!module) return;
	module.notifyReactNativeReady();
}
