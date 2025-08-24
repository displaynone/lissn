import { GITHUB_PROJECT_URL } from "@/constants/generic";
import { useGetSetShowDrawer } from "@/store/appStore";
import { Trans, useLingui } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { Linking } from "react-native";
import { Button, H1, XStack, YStack } from "tamagui";
import packageData from "../../package.json";
import AlbumIcon from "../icons/AlbumIcon";
import GithubIcon from "../icons/GithubIcon";
import Logo from "../icons/Logo";
import SettingsIcon from "../icons/SettingsIcon";
import { ActionItem } from "../ui/ActionItem";
import { Text } from "../ui/Text";

const DrawerContent: React.FC = () => {
	const { t } = useLingui();
	const router = useRouter();
	const setShowDrawer = useGetSetShowDrawer();

	return (
		<YStack p="$3" paddingTop="$8" jc="space-between" h="100%">
			<YStack jc="space-between" ai="center" gap="$6">
				<XStack gap="$6">
					<YStack gap={0} jc="space-between">
						<H1
							fontSize="$10"
							fontWeight="$2"
							color="$color.primary"
							letterSpacing="$8"
							p={0}
							lineHeight={24}
						>
							Lissn
						</H1>
						<Text fontWeight="$2">
							<Trans>Your music app</Trans>
						</Text>
					</YStack>
					<Logo size={72} />
				</XStack>
				<YStack gap="$3" width="100%">
					<ActionItem
						icon={<AlbumIcon color="white" size={18} />}
						title={<Text color="$color.tertiary">{t`Albums`}</Text>}
						onPress={() => {
							router.push("/albums");
							setShowDrawer(false);
						}}
						backgroundColor={"transparent"}
					/>
					<ActionItem
						icon={<SettingsIcon color="white" size={18} />}
						title={<Text color="$color.tertiary">{t`Settings`}</Text>}
						onPress={() => {
							router.push("/settings");
							setShowDrawer(false);
						}}
						backgroundColor={"transparent"}
					/>
				</YStack>
			</YStack>
			<YStack>
				<XStack ai="flex-end">
					<Button
						// circular
						transparent
						p={0}
						onPress={() => Linking.openURL(GITHUB_PROJECT_URL)}
					>
						<GithubIcon color="white" />
						<Text>
							<Trans>GitHub Project</Trans>
						</Text>
					</Button>
				</XStack>
				<Text textAlign="right" fontWeight="$9" fontSize={10}>
					v{packageData.version}
				</Text>
			</YStack>
		</YStack>
	);
};

export default DrawerContent;
