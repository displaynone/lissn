import { useGetPlayer, useGetUpdateProgress } from "@/store/usePlayerStore";
import { useEffect, useState } from "react";

export const usePlayerProgress = (intervalMs: number = 500) => {
	const player = useGetPlayer();
	const updateProgressNotification = useGetUpdateProgress();
	const [progress, setProgress] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	useEffect(() => {
		if (!player) {
			setProgress(0);
			setCurrentTime(0);
			setDuration(0);
			return;
		}

		let interval: number;

		const updateProgress = async () => {
			try {
				const status = player.currentStatus;
				if (status?.isLoaded && status?.duration) {
					const percentage = (status.currentTime / status.duration) * 100;
					setProgress(percentage);
					setCurrentTime(status.currentTime);
					if (!duration || duration !== status.duration) {
						setDuration(status.duration);
					}

					// Actualizar progreso en la notificación de Android
					updateProgressNotification(status.currentTime, status.duration);
				}
			} catch (error) {
				console.warn('Error updating progress:', error);
			}
		};

		// Actualizar inmediatamente
		updateProgress();

		// Configurar intervalo
		interval = setInterval(updateProgress, intervalMs);

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [player, intervalMs, duration, updateProgressNotification]);

	return {progress, currentTime, duration};
};
