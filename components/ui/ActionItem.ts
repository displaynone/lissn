import { ListItem, styled } from "tamagui";

export const ActionItem = styled(ListItem, {
  pressTheme: true,
  ai: "stretch",
  bg: "$color.backgroundTransparent02",
  pressStyle: {
    bg: "$color.backgroundTransparent20",
  },
});