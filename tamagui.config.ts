import { config } from "@tamagui/config/v3";
import { createFont, createTamagui, createTokens } from "tamagui";

const tokens = createTokens({
	...config.tokens,
	color: {
		...config.tokens.color,
		background: "#000000",
		color: "#ffffff",
		primary: "#afd8ec",
		secondary: "#4ECDC4",
		transparentBackground: "rgba(255, 255, 255, 0.02)",
	},
});

const themes = {
	...config.themes,
	light: {
		...config.themes.light,
		background: "#000", //tokens.color.background,
		color: tokens.color.color,
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
	family: 'Inter, serif',
	size: {
			4: 10,
			5: 12,
			6: 15,
			7: 18,
			8: 20,
			9: 24,
			10: 32,
			12: 40,
			14: 48
	},
	transform: {
			6: 'uppercase',
			7: 'none',
	},
	weight: {
			6: '400',
			7: '700',
	},
	color: {
			6: '$colorFocus',
			7: '$color',
	},
	letterSpacing: {
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
			100: { normal: 'InterThin' },
			200: { normal: 'InterLight' },
			400: { normal: 'Inter' },
			500: { normal: 'InterBold' },
			600: { normal: 'InterBold' },
			700: { normal: 'InterBold' },
			800: { normal: 'InterBold' },
			900: { normal: 'InterBold' },
	},
})

export const tamaguiConfig = createTamagui({
	...config,
	fonts: {
		...config.fonts,
		inter: InterFont,
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
