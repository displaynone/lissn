import {
	borderTopGradientColors,
	navigationButtonBackground,
} from "@/constants/generic";
import { tamaguiConfig } from "@/tamagui.config";
import { IconProps } from "@/utils/types";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Href, usePathname, useRouter } from "expo-router";
import { FC } from "react";
import { Button, XStack, YStack } from "tamagui";
import ArtistsIcon from "../icons/ArtistsIcon";
import FavoriteIcon from "../icons/FavoriteIcon";
import HomeIcon from "../icons/HomeIcon";
import PlaylistIcon from "../icons/PlaylistIcon";
import SongsIcon from "../icons/SongsIcon";


type NavButton = {
	path: Href;
	Icon: FC<IconProps>;
};

const BottomNavigation = () => {
	const pathname = usePathname();
	const router = useRouter();

	if (pathname === "/song/playing") return null;

	const regularColor = tamaguiConfig.tokens.color.white.val;
	const activeColor = tamaguiConfig.tokens.color.white.val;

	const buttons: NavButton[] = [
		{
			path: "/artists",
			Icon: ArtistsIcon,
		},
		{
			path: "/song",
			Icon: SongsIcon,
		},
		{
			path: "/",
			Icon: HomeIcon,
		},
		{
			path: "/playlists",
			Icon: PlaylistIcon,
		},
		{
			path: "/playlists/favorites",
			Icon: FavoriteIcon,
		},
	];

	return (
		<YStack
			borderTopEndRadius="$3"
			borderTopStartRadius="$3"
			overflow="hidden"
			backgroundColor="$color.dark"
			// pos="absolute"
			// bottom={-4}
			alignSelf="center"
			w="100%"
			boxShadow="0px 1px 20px black"
		>
			<LinearGradient
				colors={borderTopGradientColors}
				start={[0, 1]}
				end={[1, 1]}
				flex={1}
				justifyContent="center"
				alignItems="center"
				borderRadius="$4"
				pos="absolute"
				width="100%"
				h={1}
			></LinearGradient>
			<XStack justifyContent="space-around" alignItems="center" padding="$2">
				{buttons.map((button, index) => {
					const isActive = pathname === button.path;
					return (
						<LinearGradient
							colors={
								isActive
									? navigationButtonBackground
									: ["transparent", "transparent"]
							}
							start={[0, 0]}
							end={[1, 1]}
							key={index}
							overflow="hidden"
							borderRadius={50}
							ai="center"
							jc="center"
							p={0}
						>
							<Button
								circular
								backgroundColor="transparent"
								onPress={() => router.push(button.path)}
							>
								<button.Icon
									size={isActive ? 24 : 24}
									color={isActive ? activeColor : regularColor}
								/>
							</Button>
						</LinearGradient>
					);
				})}
			</XStack>
		</YStack>
	);
};

export default BottomNavigation;
