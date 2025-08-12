import {
	borderTopGradientColors,
	navigationButtonBackground,
} from "@/constants/generic";
import { tamaguiConfig } from "@/tamagui.config";
import { IconProps } from "@/utils/types";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Href, usePathname, useRouter } from "expo-router";
import { FC, useRef } from "react";
import { View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Button, TamaguiElement, XStack, YStack } from "tamagui";
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
	const refs = useRef<(TamaguiElement | null)[]>([]);
	const left = useSharedValue(0);

	const animatedStyle = useAnimatedStyle(() => ({
		left: withTiming(left.value, {
			duration: 300,
			easing: Easing.linear,
		}),
	}));

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
			<Animated.View style={[animatedStyle, { position: "absolute", top: 8 }]}>
				<LinearGradient
					colors={navigationButtonBackground}
					start={[0, 0]}
					end={[1, 1]}
					overflow="hidden"
					borderRadius={50}
					p={0}
					w={42}
					h={42}
				></LinearGradient>
			</Animated.View>
			<XStack justifyContent="space-around" alignItems="center" padding="$2">
				{buttons.map((button, index) => {
					const isActive = pathname === button.path;
					return (
						<Button
							ref={(el) => {
								refs.current[index] = el;
							}}
							key={index}
							circular
							backgroundColor="transparent"
							onPress={() => {
								(refs.current[index] as View)?.measure((x) => {
									left.value = x + 2;
								});
								router.push(button.path);
							}}
						>
							<button.Icon
								size={isActive ? 24 : 24}
								color={isActive ? activeColor : regularColor}
							/>
						</Button>
					);
				})}
			</XStack>
		</YStack>
	);
};

export default BottomNavigation;
