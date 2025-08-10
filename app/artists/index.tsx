import { Text, YStack } from "tamagui";
import Player from "@/components/partials/Player";

export default function ArtistsScreen() {
        return (
                <YStack flex={1} justifyContent="center" alignItems="center">
                        <Text>Artists</Text>
                        <Player />
                </YStack>
        );
}
