import { useGetSearch, useGetSetSearch } from "@/store/songsStore";
import { tamaguiConfig } from "@/tamagui.config";
import { debounce } from "@/utils/debounce";
import { useLingui } from "@lingui/react/macro";
import { usePathname } from "expo-router";
import React, { useState } from "react";
import { NativeSyntheticEvent, TextInputChangeEventData } from "react-native";
import { Button, H1, View, XStack, YStack } from "tamagui";
import MenuIcon from "../icons/MenuIcon";
import SearchIcon from "../icons/SearchIcon";
import { Input } from "../ui/Input";

const Heading: React.FC = () => {
	const { t } = useLingui();
	const pathname = usePathname();
	const appSearchValue = useGetSearch();
	const setAppSearch = useGetSetSearch();
	const [showSearch, setShowSearch] = useState(!!appSearchValue);
	const [search, setSearch] = useState(appSearchValue);

	const debounceSearch = debounce((text: string) => setAppSearch(text), 500);

	const handleSearch = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
		setSearch(e.nativeEvent.text);
		debounceSearch(e.nativeEvent.text);
	}

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
		<YStack gap={0}>
			<XStack gap={"$6"} ai="center" m={"$2"} jc="space-between">
				<Button circular backgroundColor={"transparent"}>
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
			{showSearch && (
				<View p="$4">
					<Input placeholder={t`Search songs`} value={search} onChange={handleSearch}/>
				</View>
			)}
		</YStack>
	);
};

export default Heading;
