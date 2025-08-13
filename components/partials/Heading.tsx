import { useLingui } from "@lingui/react/macro";
import { usePathname } from "expo-router";
import React from "react";
import { Button, H1, View, XStack } from "tamagui";
import MenuIcon from "../icons/MenuIcon";

const Heading: React.FC = () => {
	const { t } = useLingui();
	const pathname = usePathname();

	const getTitle = () => {
		switch (pathname) {
			case "/song":
				return t`Songs`;
			case "/playlists/favorites":
				return t`Favorites`;
			default:
				return "Lissn";
		}
	};

	return (
		<XStack gap={"$6"} ai="center" m={"$2"} jc="space-between">
			{/* <LogoIcon size={48} /> */}
			<Button circular backgroundColor={"$backgroundTransparent05"}>
				<MenuIcon color="white" />
			</Button>
			<H1
				fontSize="$9"
				fontWeight="$1"
				f={1}
				textAlign="center"
				color="$color.tertiary"
				letterSpacing="$8"
			>
				{getTitle()}
			</H1>
			<View w={48}></View>
		</XStack>
	);
};

export default Heading;
