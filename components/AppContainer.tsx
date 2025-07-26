import {
	useIsSynced,
	useIsSyncing,
	useRefreshSongs,
	useStartSync,
} from "@/store/songsStore";
import React, { useEffect } from "react";
import { LinearGradient } from "tamagui/linear-gradient";

const AppContainer: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const startSync = useStartSync();
	const isSynced = useIsSynced();
	const isSyncing = useIsSyncing();
	const refreshSongs = useRefreshSongs();
	useEffect(() => {
		if (!isSynced && !isSyncing) {
			(async () => {
				try {
					await startSync();
					await refreshSongs();
				} catch (error) {
					console.error("Error during sync:", error);
				}
			})();
		}
	});

	return (
		<LinearGradient
			colors={["#000000", "#000000", "#020b3a"]}
			start={[0, 0]}
			end={[1, 1]}
			flex={1}
			justifyContent="center"
			alignItems="center"
			borderRadius="$4"
		>
			{children}
		</LinearGradient>
	);
};

export default AppContainer;
