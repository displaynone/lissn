import { SHOW_PLAYING_PAGE_SLIDE_TIME } from "@/constants/generic";
import { useGetPlayingSongAndArtist } from "@/hooks/useGetPlayingSongAndArtist";
import { useGetSongDetailPageLoaded } from "@/store/appStore";
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
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { View } from "tamagui";
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
	const { height: windowHeight } = useWindowDimensions();
	const top = useSharedValue(windowHeight);
	const detailPageLoaded = useGetSongDetailPageLoaded();

	useEffect(() => {
		const timeout = setTimeout(() => {
			NavigationBar.setVisibilityAsync("hidden");
		}, 500); // o 200ms
		return () => clearTimeout(timeout);
	}, []);

	useEffect(() => {
		top.value = windowHeight;
	}, [pathname, top, windowHeight]);

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

	const animatedStyle = useAnimatedStyle(() => {
		return {
			top: top.value,
		};
	});

	useEffect(() => {
		if (showCover && detailPageLoaded) {
			top.value = withTiming(0, { duration: SHOW_PLAYING_PAGE_SLIDE_TIME  });
		}
	});

	return (
		<View
			bg={"$color.background"}
			flex={1}
			justifyContent="center"
			alignItems="center"
			borderRadius="$4"
		>
			{showCover && (
				<Animated.View style={[styles.coverFullScreen, animatedStyle]}>
					<Cover
						coverPath={song.coverPath || ""}
						alternativeCoverOpacity={1}
						style={styles.coverFullScreen}
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
							backgroundColor:
								tamaguiConfig.tokens.color.backgroundDarkTransparent20.val,
						}}
						experimentalBlurMethod="dimezisBlurView"
					/>
				</Animated.View>
			)}
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	coverFullScreen: {
		position: "absolute",
		left: 0,
		width: "100%",
		height: "100%",
		borderRadius: 0,
		overflow: "hidden",
	},
});
export default AppContainer;
