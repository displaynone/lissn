import { tamaguiConfig } from "@/tamagui.config";
import { darken } from "color2k";

export const COVER_SIZE = 56;
export const COVER_STROKE_WIDTH = 2;
export const SHOW_PLAYING_PAGE_SLIDE_TIME = 400;

export const borderTopNavigatorGradientColors: string[] = [
	tamaguiConfig.tokens.color.backgroundTransparent05.val,
	tamaguiConfig.tokens.color.backgroundTransparent10.val,
	tamaguiConfig.tokens.color.backgroundTransparent30.val,
	tamaguiConfig.tokens.color.backgroundTransparent10.val,
	tamaguiConfig.tokens.color.backgroundTransparent05.val,
];
export const borderTopGradientColors: string[] = [
	tamaguiConfig.tokens.color.backgroundTransparent02.val,
	tamaguiConfig.tokens.color.backgroundTransparent05.val,
	tamaguiConfig.tokens.color.backgroundTransparent30.val,
	tamaguiConfig.tokens.color.backgroundTransparent10.val,
	tamaguiConfig.tokens.color.backgroundTransparent05.val,
	tamaguiConfig.tokens.color.backgroundTransparent02.val,
];
export const borderBottomGradientColors: string[] = [
	"transparent",
	"transparent",
	"transparent",
	tamaguiConfig.tokens.color.backgroundTransparent02.val,
	tamaguiConfig.tokens.color.backgroundTransparent05.val,
	tamaguiConfig.tokens.color.backgroundTransparent10.val,
	tamaguiConfig.tokens.color.backgroundTransparent02.val,
	"transparent",
];
export const backgroundSkeleton: string[] = [
	"transparent",
	"transparent",
	"transparent",
	tamaguiConfig.tokens.color.backgroundTransparent02.val,
	tamaguiConfig.tokens.color.backgroundTransparent05.val,
	tamaguiConfig.tokens.color.backgroundTransparent05.val,
	tamaguiConfig.tokens.color.backgroundTransparent02.val,
	"transparent",
	"transparent",
	"transparent",
];
export const navigationButtonBackground: string[] = [
	tamaguiConfig.tokens.color.secondary.val,
	tamaguiConfig.tokens.color.secondary.val,
	darken(tamaguiConfig.tokens.color.secondary.val, 0.2),
];
