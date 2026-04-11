import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import AppContainer from "@/components/AppContainer";
import BottomNavigation from "@/components/partials/BottomNavigation";
import ToastContent from "@/components/ui/ToastContent";
import { AudioLibraryProvider } from "@/hooks/providers/MediaLibraryProvider";
import { tamaguiConfig } from "@/tamagui.config";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { setAudioModeAsync } from "expo-audio";
import { getLocales } from "expo-localization";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";
import arCatalog from "../locales/ar/messages.js";
import deCatalog from "../locales/de/messages.js";
import enCatalog from "../locales/en/messages.js";
import esCatalog from "../locales/es/messages.js";
import frCatalog from "../locales/fr/messages.js";
import hiCatalog from "../locales/hi/messages.js";
import itCatalog from "../locales/it/messages.js";
import jaCatalog from "../locales/ja/messages.js";
import koCatalog from "../locales/ko/messages.js";
import zhCatalog from "../locales/zh/messages.js";

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

SplashScreen.preventAutoHideAsync();

// Load and activate messages based on device language
const catalogs: Record<string, any> = {
	en: enCatalog.messages,
	es: esCatalog.messages,
	fr: frCatalog.messages,
	it: itCatalog.messages,
	de: deCatalog.messages,
	ko: koCatalog.messages,
	ja: jaCatalog.messages,
	ar: arCatalog.messages,
	zh: zhCatalog.messages,
	hi: hiCatalog.messages,
};

const deviceLanguage = getLocales()[0]?.languageCode ?? "en";
const activeLocale = catalogs[deviceLanguage] ? deviceLanguage : "en";

i18n.loadAndActivate({
	locale: activeLocale,
	messages: catalogs[activeLocale],
});

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
		if (loaded) {
			SplashScreen.hide();
		}
	}, [loaded]);

	useEffect(() => {
		const setAudioMode = async () => {
			await setAudioModeAsync({
				interruptionMode: "doNotMix",
				shouldPlayInBackground: true,
			});
		};
		setAudioMode();
	}, []);

	if (!loaded) return null;

	return (
		<I18nProvider i18n={i18n}>
			<TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
				<ToastProvider burntOptions={{ from: "bottom" }}>
					<AudioLibraryProvider>
						<GestureHandlerRootView style={{ flex: 1 }}>
							<AppContainer>
								<View style={{ height: insets.top, backgroundColor }} />
								<StatusBar style="light" translucent />
								<SafeAreaView
									style={{ flex: 1, width: "100%" }}
									edges={["left", "right", "bottom"]}
								>
									<View style={{ flex: 1 }}>
										<Slot />
										<BottomNavigation />
										<ToastContent />
										<ToastViewport
											flexDirection="column"
											bottom={30}
											left={0}
											right={0}
										/>
									</View>
								</SafeAreaView>
							</AppContainer>
						</GestureHandlerRootView>
					</AudioLibraryProvider>
				</ToastProvider>
			</TamaguiProvider>
		</I18nProvider>
	);
}
