import { useGetPlayer } from "@/store/usePlayerStore";
import { useEffect, useState } from "react";

export const usePlayerProgress = (intervalMs: number = 500) => {
	const player = useGetPlayer();
	const [progress, setProgress] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	useEffect(() => {
		if (!player) {
			setProgress(0);
			return;
		}

		let interval: number;

		const updateProgress = async () => {
			const status = player.currentStatus;
			if (status.isLoaded && status.duration) {
				const percentage = status.currentTime / status.duration * 100;
				setProgress(percentage);
        setCurrentTime(status.currentTime);
        if (!duration) {
          setDuration(status.duration);
        }
			}
		};

		interval = setInterval(updateProgress, intervalMs);

		return () => {
			clearInterval(interval);
		};
	}, [player, intervalMs, duration]);

	return {progress, currentTime, duration};
};
