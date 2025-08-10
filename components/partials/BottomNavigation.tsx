import { usePathname, useRouter } from "expo-router";
import { XStack, Button } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";

const BottomNavigation = () => {
        const pathname = usePathname();
        const router = useRouter();

        if (pathname === "/song/playing") return null;

        return (
                <XStack
                        justifyContent="space-around"
                        alignItems="center"
                        padding="$4"
                        backgroundColor="$background"
                        position="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                >
                        <Button
                                backgroundColor="transparent"
                                onPress={() => router.push("/artists")}
                        >
                                <Ionicons name="people" size={24} color="white" />
                        </Button>
                        <Button
                                backgroundColor="transparent"
                                onPress={() => router.push("/")}
                        >
                                <Ionicons name="home" size={24} color="white" />
                        </Button>
                        <Button
                                backgroundColor="transparent"
                                onPress={() => router.push("/playlists")}
                        >
                                <Ionicons name="musical-notes" size={24} color="white" />
                        </Button>
                </XStack>
        );
};

export default BottomNavigation;
