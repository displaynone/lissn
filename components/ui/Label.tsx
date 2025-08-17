// ui/AppLabel.ts
import { Label as TamaguiLabel, styled } from "tamagui";

export const Label = styled(TamaguiLabel, {
	size: "$5",
	fontWeight: "200",
	minHeight: 0,
	lineHeight: 20,
	p: 0,
	m: 0,
	color: "$color",
	textTransform: "none",
});
