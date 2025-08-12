import Player from "@/components/partials/Player";
import { Text, YStack } from "tamagui";

export default function FavoritesScreen() {
	return (
		<YStack flex={1} justifyContent="center" alignItems="center">
			<Text>Favorites</Text>
			<Player />
		</YStack>
	);
}
