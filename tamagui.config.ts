import { config } from "@tamagui/config/v3";
import { darken, transparentize } from "color2k";
import { createFont, createTamagui, createTokens } from "tamagui";

// #3d5a80, #98c1d9, #e0fbfc, #ee6c4d, #293241
const colors = {
	navy: "#3d5a80",
	blue: "#98c1d9",
	cyan: "#e0fbfc",
	orange: "#ee6c4d",
	dark: "#293241",
	black: "#000000",
	white: "#ffffff",
};

const tokens = createTokens({
	...config.tokens,
	color: {
		...config.tokens.color,
		background: darken(colors.navy, 0.25),
		color: colors.navy,
		primary: colors.blue,
		secondary: colors.orange,
		tertiary: colors.cyan,
		dark: colors.dark,
		black: colors.black,
		white: colors.white,
		backgroundTransparent02: "rgba(255, 255, 255, 0.02)",
		backgroundTransparent05: "rgba(255, 255, 255, 0.05)",
		backgroundTransparent10: "rgba(255, 255, 255, 0.10)",
		backgroundTransparent20: "rgba(255, 255, 255, 0.20)",
		backgroundTransparent30: "rgba(255, 255, 255, 0.30)",
		backgroundTransparent50: "rgba(255, 255, 255, 0.50)",
		backgroundDarkTransparent02: "rgba(0, 0, 0, 0.10)",
		backgroundDarkTransparent10: "rgba(0, 0, 0, 0.10)",
		backgroundDarkTransparent20: "rgba(0, 0, 0, 0.20)",
		backgroundDarkTransparent40: "rgba(0, 0, 0, 0.40)",
		backgroundGradientStart: "#293241",
		backgroundGradientMiddle: "#293241",
		backgroundGradientEnd: "#293241",
		backgroundBottomNavigation: "#0d0f1aaa",
		backgroundSongActive: transparentize(colors.orange, 0.8),
	},
});

const themes = {
	...config.themes,
	light: {
		...config.themes.light,
		background: "#000", //tokens.color.background,
		color: "#fff",
		primary: tokens.color.primary,
	},
	dark: {
		...config.themes.dark,
		background: "#000",
		color: "#fff",
		primary: "#FF6B6B",
	},
};

const InterFont = createFont({
	family: "Inter, serif",
	size: {
		4: 10,
		5: 12,
		6: 15,
		7: 18,
		8: 20,
		9: 24,
		10: 32,
		12: 40,
		14: 48,
	},
	transform: {
		6: "uppercase",
		7: "none",
	},
	weight: {
		1: "100",
		2: "200",
		6: "400",
		7: "700",
		9: "900",
	},
	color: {
		6: "$colorFocus",
		7: "$color",
	},
	letterSpacing: {
		1: 1,
		5: 2,
		6: 1,
		7: 5,
		8: -1,
		9: -2,
		10: -3,
		12: -4,
		14: -5,
		15: -6,
	},
	// these will be used when run in native mode.
	face: {
		100: { normal: "InterThin" },
		200: { normal: "InterLight" },
		400: { normal: "Inter" },
		500: { normal: "InterBold" },
		600: { normal: "InterBold" },
		700: { normal: "InterBold" },
		800: { normal: "InterBold" },
		900: { normal: "InterBold" },
	},
});

export const tamaguiConfig = createTamagui({
	...config,
	fonts: {
		...config.fonts,
		inter: InterFont,
		heading: InterFont,
		body: InterFont,
	},
	tokens,
	themes,
});

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module "tamagui" {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface TamaguiCustomConfig extends Conf {}
}
