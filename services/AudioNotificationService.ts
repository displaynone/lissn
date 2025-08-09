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

const { AudioNotificationModule } = NativeModules as {
	AudioNotificationModule: AudioNotificationModuleType;
};

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

// Iniciar notificación (al empezar a reproducir)
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

	await AudioNotificationModule.startService(
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

// Actualizar estado (play/pause / metadata / carátula)
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

	// Si incluye datos de progreso, usar updateWithProgress
	if (currentTime !== null || duration !== null) {
		AudioNotificationModule.updateWithProgress(
			title,
			artist,
			smallIconName,
			largeIconPath,
			typeof isPlaying === "boolean" ? isPlaying : null,
			currentTime,
			duration
		);
	} else {
		// Usar el método original si no hay datos de progreso
		AudioNotificationModule.update(
			title,
			artist,
			smallIconName,
			largeIconPath,
			typeof isPlaying === "boolean" ? isPlaying : null
		);
	}
}

// Función específica para actualizar solo el progreso
export function updateNotificationProgress(currentTime: number, duration: number): void {
	AudioNotificationModule.updateProgress(currentTime, duration);
}

// Parar servicio (al detener reproducción)
export function stopNotification(): void {
	AudioNotificationModule.stop();
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
    console.log('Registering audio-notif-play-pause listener');
    subs.push(
      DeviceEventEmitter.addListener("audio-notif-play-pause", (data) => {
        console.log('Received audio-notif-play-pause event with data:', data);
        onPlayPause();
      })
		);
	}
	if (onNext) {
    console.log('Registering audio-notif-next listener');
		subs.push(DeviceEventEmitter.addListener("audio-notif-next", (data) => {
      console.log('Received audio-notif-next event with data:', data);
      onNext();
    }));
	}
	if (onPrev) {
    console.log('Registering audio-notif-prev listener');
		subs.push(DeviceEventEmitter.addListener("audio-notif-prev", (data) => {
      console.log('Received audio-notif-prev event with data:', data);
      onPrev();
    }));
	}
	if (onStop) {
    console.log('Registering audio-notif-stop listener');
		subs.push(DeviceEventEmitter.addListener("audio-notif-stop", (data) => {
      console.log('Received audio-notif-stop event with data:', data);
      onStop();
    }));
	}
	if (onSeekTo) {
    console.log('Registering audio-notif-seek-to listener');
		subs.push(DeviceEventEmitter.addListener("audio-notif-seek-to", (data) => {
      console.log('Received audio-notif-seek-to event with data:', data);
      const position = data?.position || 0;
      onSeekTo(position);
    }));
	}

	// Notificar al servicio nativo que React Native está listo
	console.log('Notifying native service that React Native is ready');
	// Pequeño delay para asegurar que todos los listeners estén registrados
	setTimeout(() => {
		console.log('Calling AudioNotificationModule.notifyReactNativeReady()');
		AudioNotificationModule.notifyReactNativeReady();
	}, 100);

	return () => subs.forEach((s) => s.remove());
}

// Función adicional para notificar manualmente que RN está listo
export function notifyReactNativeReady(): void {
	AudioNotificationModule.notifyReactNativeReady();
}
