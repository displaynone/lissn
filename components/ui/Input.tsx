// ui/AppInput.ts
import { Input as TamaguiInput, styled } from "tamagui";

export const Input = styled(TamaguiInput, {
	size: "$5",
	p: "$3",
	borderRadius: "$4",
	borderWidth: 1,
	borderColor: "$color.color",
	backgroundColor: "$backgroundTransparent10",
	color: "$color.white",
	placeholderTextColor: "$color.primary",
	textTransform: "none",
});
