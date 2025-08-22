// ui/AppInput.ts
import { H1 as TamaguiH1, H2 as TamaguiH2, styled } from "tamagui";

export const H1 = styled(TamaguiH1, {
	fontSize: "$9",
	fontWeight: "$1",
	f: 1,
	textAlign: "center",
	color: "$color.tertiary",
	letterSpacing: "$8",
});

export const H2 = styled(TamaguiH2, {
	fontSize: "$6",
	fontWeight: "$2",
	color: "$color.primary",
	letterSpacing: "$8",
});
