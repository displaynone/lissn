import { useGetPlayingSongAndArtist } from "@/hooks/useGetPlayingSondAndArtist";
import {
	useIsSynced,
	useIsSyncing,
	useRefreshSongs,
	useStartSync,
} from "@/store/songsStore";
import { tamaguiConfig } from "@/tamagui.config";
import { BlurView } from "expo-blur";
import * as NavigationBar from "expo-navigation-bar";
import { usePathname } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { View } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import Cover from "./partials/Cover";

const AppContainer: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const startSync = useStartSync();
	const isSynced = useIsSynced();
	const isSyncing = useIsSyncing();
	const refreshSongs = useRefreshSongs();
	const { song } = useGetPlayingSongAndArtist();
	const pathname = usePathname();

	useEffect(() => {
		const timeout = setTimeout(() => {
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
	const showCover = !!song && isDetailedView;

	const gradientColors: string[] = [
		tamaguiConfig.tokens.color.backgroundGradientStart.val,
		tamaguiConfig.tokens.color.backgroundGradientMiddle.val,
		tamaguiConfig.tokens.color.backgroundGradientEnd.val,
	];

	return (
		<LinearGradient
			colors={gradientColors}
			start={[0, 1]}
			end={[1, 1]}
			flex={1}
			justifyContent="center"
			alignItems="center"
			borderRadius="$4"
		>
			{showCover && (
				<View style={{ ...styles.coverFullScreen }}>
					<Cover
						coverPath={song.coverPath || ""}
						alternativeCoverOpacity={1}
						style={{ ...styles.coverFullScreen }}
						resizeMode="cover"
						showDefault={false}
					/>
					<BlurView
						intensity={30}
						tint="dark"
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							backgroundColor: tamaguiConfig.tokens.color.backgroundDarkTransparent20.val,
						}}
						experimentalBlurMethod="dimezisBlurView"
					/>
				</View>
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
