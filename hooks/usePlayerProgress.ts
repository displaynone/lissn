import { database } from "@/database";
import { Settings, SETTINGS_KEYS } from "@/models/Settings";
import { useGetPlayer, useGetUpdateProgress } from "@/store/usePlayerStore";
import { Q } from "@nozbe/watermelondb";
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

					updateProgressNotification(status.currentTime, status.duration);
					const lastPlayedAt = await database
						.get<Settings>("settings")
						.query([Q.where("key", SETTINGS_KEYS.LAST_PLAYED_AT), Q.take(1)])
						.fetch();
					if (lastPlayedAt.length > 0) {
						await database.write(async () => {
							await lastPlayedAt[0].update((setting) => {
								setting.value = JSON.stringify({
									currentTime: status.currentTime,
									duration: status.duration,
								});
							});
						});
					} else {
						await database.write(async () => {
							await database.get<Settings>("settings").create((setting) => {
								setting.key = SETTINGS_KEYS.LAST_PLAYED_AT;
								setting.value = status.currentTime.toString();
							});
						});
					}
				}
			} catch (error) {
				console.warn("Error updating progress:", error);
			}
		};

		updateProgress();

		interval = setInterval(updateProgress, intervalMs);

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [player, intervalMs, duration, updateProgressNotification]);

	return { progress, currentTime, duration };
};
