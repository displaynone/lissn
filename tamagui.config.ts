import { config } from "@tamagui/config/v3";
import { createTamagui, createTokens } from "tamagui";

const tokens = createTokens({
	...config.tokens,
	color: {
		...config.tokens.color,
		background: "#000000",
		color: "#ffffff",
		primary: "#FF6B6B",
		secondary: "#4ECDC4",
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

export const tamaguiConfig = createTamagui({ ...config, tokens, themes });

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module "tamagui" {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface TamaguiCustomConfig extends Conf {}
}
