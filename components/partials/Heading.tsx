import { useGetSetShowDrawer, useGetShowDrawer } from "@/store/appStore";
import { useGetSearch, useGetSetSearch } from "@/store/songsStore";
import { tamaguiConfig } from "@/tamagui.config";
import { debounce } from "@/utils/debounce";
import { SearchType } from "@/utils/types";
import { useLingui } from "@lingui/react/macro";
import { usePathname } from "expo-router";
import React, { useState } from "react";
import { NativeSyntheticEvent, TextInputChangeEventData } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Button, View, XStack, YStack } from "tamagui";
import MenuIcon from "../icons/MenuIcon";
import SearchIcon from "../icons/SearchIcon";
import { H1 } from "../ui/Headings";
import { Input } from "../ui/Input";

const CONTENT_HEIGHT = 70;

const Heading: React.FC = () => {
	const { t } = useLingui();
	const pathname = usePathname();
	const appSearchValue = useGetSearch();
	const setAppSearch = useGetSetSearch();
	const getSearchType = (): SearchType => {
		switch (pathname) {
			case "/albums":
				return "albums";
			case "/playlists/favorites":
				return "favorites";
			case "/artists":
				return "artists";
			default:
				return "songs";
		}
	};

	const searchType = getSearchType();
	const [showSearch, setShowSearch] = useState(!!appSearchValue?.[searchType]);

	const [search, setSearch] = useState(appSearchValue?.[searchType]);
	const setShowDrawer = useGetSetShowDrawer();
	const showDrawer = useGetShowDrawer();
	const searchHeight = useSharedValue(0);

	const animatedStyle = useAnimatedStyle(() => ({
		height: withTiming(searchHeight.value, {
			duration: 300,
			easing: Easing.linear,
		}),
	}));

	React.useEffect(() => {
		if (showSearch) {
			searchHeight.value = CONTENT_HEIGHT;
		} else {
			searchHeight.value = 0;
		}
	}, [searchHeight, showSearch]);

	const debounceSearch = debounce(
		(text: string) => setAppSearch(text, searchType),
		500
	);

	const handleSearch = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
		setSearch(e.nativeEvent.text);
		debounceSearch(e.nativeEvent.text);
	};

	const getTitle = () => {
		switch (pathname) {
			case "/song":
				return t`Songs`;
			case "/playlists/favorites":
				return t`Favorites`;
			case "/playlists":
				return t`Playlists`;
			case "/artists":
				return t`Artists`;
			case "/settings":
				return t`Settings`;
			default:
				return "Lissn";
		}
	};

	const getSearchPlaceholder = () => {
		switch (pathname) {
			case "/song":
				return t`Search songs`;
			case "/playlists/favorites":
				return t`Search favorite songs`;
			case "/artists":
				return t`Search artists`;
			default:
				return t`Search`;
		}
	};

	return (
		<YStack gap="$3">
			<XStack
				gap={"$6"}
				ai="center"
				m={"$2"}
				marginBottom={0}
				jc="space-between"
			>
				<Button
					circular
					backgroundColor={"transparent"}
					onPress={() => setShowDrawer(!showDrawer)}
				>
					<MenuIcon color="white" />
				</Button>
				<H1>{getTitle()}</H1>
				<Button
					circular
					backgroundColor={"transparent"}
					onPress={() => setShowSearch(!showSearch)}
				>
					<SearchIcon
						color={
							showSearch ? tamaguiConfig.tokens.color.primary.val : "white"
						}
					/>
				</Button>
			</XStack>
			<Animated.View style={[{ overflow: "hidden" }, animatedStyle]}>
				<View paddingBottom="$3" paddingHorizontal="$4">
					<Input
						placeholder={getSearchPlaceholder()}
						value={search}
						onChange={handleSearch}
					/>
				</View>
			</Animated.View>
		</YStack>
	);
};

export default Heading;
