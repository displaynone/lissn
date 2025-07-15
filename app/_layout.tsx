import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AudioLibraryProvider } from "@/hooks/providers/MediaLibraryProvider";
import { MusicProvider } from "@/hooks/providers/MusicProvider";
import { useColorScheme } from "@/hooks/useColorScheme";
import { tamaguiConfig } from "@/tamagui.config";
import { SafeAreaView } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	if (!loaded) {
		// Async font loading only occurs in development.
		return <></>;
	}

	return (
		<TamaguiProvider config={tamaguiConfig} defaultTheme="light">
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<AudioLibraryProvider>
					<MusicProvider>
						<SafeAreaView style={{ flex: 1 }}>
							<Stack>
								<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
								<Stack.Screen name="+not-found" />
							</Stack>
						</SafeAreaView>
						<StatusBar style="auto" />
					</MusicProvider>
				</AudioLibraryProvider>
			</ThemeProvider>
		</TamaguiProvider>
	);
}
