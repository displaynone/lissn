import {
	SHOW_DRAWER_TIME,
	SHOW_PLAYING_PAGE_SLIDE_TIME,
} from "@/constants/generic";
import { useGetPlayingSongAndArtist } from "@/hooks/useGetPlayingSongAndArtist";
import {
	useGetSetShowDrawer,
	useGetShowDrawer,
	useGetSongDetailPageLoaded,
} from "@/store/appStore";
import {
	useGetArtistById,
	useIsSynced,
	useIsSyncing,
	useRefreshAlbums,
	useRefreshArtists,
	useRefreshFavoriteSongs,
	useRefreshSongs,
	useStartSync,
} from "@/store/songsStore";
import { tamaguiConfig } from "@/tamagui.config";
import { BlurView } from "expo-blur";
import * as NavigationBar from "expo-navigation-bar";
import { usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";
import Cover from "./partials/Cover";
import DrawerContent from "./partials/DrawerContent";
import SongInfo from "./partials/SongInfo";

const AppContainer: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const startSync = useStartSync();
	const isSynced = useIsSynced();
	const isSyncing = useIsSyncing();
	const refreshSongs = useRefreshSongs();
	const refreshFavoriteSongs = useRefreshFavoriteSongs();
	const refreshArtists = useRefreshArtists();
	const refreshAlbums = useRefreshAlbums();
	const { song } = useGetPlayingSongAndArtist();
	const pathname = usePathname();
	const { height: windowHeight, width: windowWidth } = useWindowDimensions();
	const top = useSharedValue(windowHeight);
	const drawerWidth = windowWidth * 0.8;
	const drawerLeft = useSharedValue(-windowWidth);
	const detailPageLoaded = useGetSongDetailPageLoaded();
	const showDrawer = useGetShowDrawer();
	const setShowDrawer = useGetSetShowDrawer();
	const insets = useSafeAreaInsets();
	const getArtistById = useGetArtistById();

	const [artwork, setArtwork] = useState<string>();

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
					await refreshFavoriteSongs();
					await refreshArtists(100_000);
					await refreshAlbums(100_000);
				} catch (error) {
					console.error("Error during sync:", error);
				}
			})();
		}
	}, [
		isSynced,
		isSyncing,
		startSync,
		refreshSongs,
		refreshFavoriteSongs,
		refreshArtists,
		refreshAlbums,
	]);

	useEffect(() => {
		const paths = pathname.split("/");
		if (paths?.[1] === "artists" && paths?.[2] !== "edit") {
			getArtistById(paths[2]).then((artist) => setArtwork(artist?.artworkUri));
		} else {
			setArtwork(undefined);
		}
	}, [getArtistById, pathname]);

	const isDetailedView = pathname === "/song/playing";
	const showCover = !!song && isDetailedView;

	const animatedStyle = useAnimatedStyle(() => {
		return {
			top: top.value,
		};
	});
	const drawerStyle = useAnimatedStyle(() => {
		return {
			left: drawerLeft.value,
		};
	});

	useEffect(() => {
		if (showCover && detailPageLoaded) {
			top.value = withTiming(0, { duration: SHOW_PLAYING_PAGE_SLIDE_TIME });
		}
	});

	useEffect(() => {
		drawerLeft.value = withTiming(showDrawer ? 0 : -windowWidth, {
			duration: SHOW_DRAWER_TIME,
		});
	});

	return (
		<View
			bg={"$color.background"}
			flex={1}
			justifyContent="center"
			alignItems="center"
			borderRadius="$4"
		>
			<Animated.View style={[styles.drawer, drawerStyle]}>
				<Pressable
					style={styles.drawerCloser}
					onPress={() => setShowDrawer(false)}
				></Pressable>
				<View
					w={drawerWidth}
					paddingTop={insets.top}
					paddingHorizontal="$3"
					style={styles.drawerContent}
				>
					<DrawerContent />
				</View>
			</Animated.View>
			{artwork && (
				<Cover
					coverPath={artwork}
					size={windowHeight / 3}
					resizeMode="cover"
					style={{ width: "100%", position: "absolute", top: 0 }}
					borderRadius={0}
				/>
			)}
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
			<SongInfo />
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
	drawer: {
		position: "absolute",
		height: "100%",
		zIndex: 100,
		width: "100%",
	},
	drawerCloser: {
		position: "absolute",
		backgroundColor: tamaguiConfig.tokens.color.backgroundDarkTransparent02.val,
		width: "100%",
		height: "100%",
		top: 0,
		left: 0,
	},
	drawerContent: {
		backgroundColor: tamaguiConfig.tokens.color.dark.val,
		boxShadow: "10px 0px 20px black",
		height: "100%",
		borderTopRightRadius: 24,
		borderBottomRightRadius: 24,
	},
});
export default AppContainer;
