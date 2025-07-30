import {
	useIsSynced,
	useIsSyncing,
	useRefreshSongs,
	useStartSync,
} from "@/store/songsStore";
import { useGetPlayingSong } from "@/store/usePlayerStore";
import * as NavigationBar from "expo-navigation-bar";
import { usePathname } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "tamagui/linear-gradient";
import Cover from "./partials/Cover";

const AppContainer: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const startSync = useStartSync();
	const isSynced = useIsSynced();
	const isSyncing = useIsSyncing();
	const refreshSongs = useRefreshSongs();
	const song = useGetPlayingSong();
	const pathname = usePathname();

	useEffect(() => {
		const timeout = setTimeout(() => {
			console.log("Hiding navigation bar");
			NavigationBar.setVisibilityAsync("hidden");
		}, 500); // o 200ms
		return () => clearTimeout(timeout);
	}, []);

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
	}, [isSynced, isSyncing, startSync, refreshSongs]);

	const isDetailedView = pathname === "/song/playing";

	return (
		<LinearGradient
			colors={["#00020a", "#010724", "#020b3a"]}
			start={[0, 1]}
			end={[1, 1]}
			flex={1}
			justifyContent="center"
			alignItems="center"
			borderRadius="$4"
		>
			{!!song && isDetailedView && (
				<Cover
					coverPath={song.coverPath || ""}
					alternativeCoverOpacity={1}
					style={{ ...styles.coverFullScreen }}
					resizeMode="cover"
					blurRadius={40}
				/>
			)}
			{children}
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	coverFullScreen: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: "100%",
		height: "100%",
		borderRadius: 0,
		overflow: "hidden",
	},
});
export default AppContainer;
