import {
  useIsSynced,
  useIsSyncing,
  useRefreshSongs,
  useStartSync,
} from "@/store/songsStore";
import React, { useEffect } from "react";

const AppContainer: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const startSync = useStartSync();
	// const syncProgress = useSyncProgress();
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
	return <>{children}</>;
};

export default AppContainer;
