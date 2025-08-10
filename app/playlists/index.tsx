import { Text, YStack } from "tamagui";
import Player from "@/components/partials/Player";

export default function PlaylistsScreen() {
        return (
                <YStack flex={1} justifyContent="center" alignItems="center">
                        <Text>Playlists</Text>
                        <Player />
                </YStack>
        );
}
