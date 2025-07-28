import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import AppContainer from "@/components/AppContainer";
import { AudioLibraryProvider } from "@/hooks/providers/MediaLibraryProvider";
import { tamaguiConfig } from "@/tamagui.config";
import { setAudioModeAsync } from "expo-audio";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { View } from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";

export default function RootLayout() {
	const insets = useSafeAreaInsets();

	const [loaded] = useFonts({
		Inter: require("@tamagui/font-inter/otf/Inter-Regular.otf"),
		InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
		InterLight: require("@tamagui/font-inter/otf/Inter-Light.otf"),
		InterThin: require("@tamagui/font-inter/otf/Inter-Thin.otf"),
	});

	const backgroundColor = tamaguiConfig.themes["dark"].background.val;

	useEffect(() => {
		SystemUI.setBackgroundColorAsync(backgroundColor);
	}, [backgroundColor]);

	useEffect(() => {
		const setAudioMode = async () => {
			await setAudioModeAsync({
				interruptionModeAndroid: "doNotMix",
				shouldPlayInBackground: true,
			});
		};
		setAudioMode();
	}, []);

	if (!loaded) return null;

	return (
		<TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
			<AudioLibraryProvider>
				<AppContainer>
					<View style={{ height: insets.top, backgroundColor }} />
					<StatusBar style="light" translucent />
					<SafeAreaView
						style={{ flex: 1, padding: 10, width: "100%" }}
						edges={["left", "right", "bottom"]}
					>
						<Slot />
					</SafeAreaView>
				</AppContainer>
			</AudioLibraryProvider>
		</TamaguiProvider>
	);
}
