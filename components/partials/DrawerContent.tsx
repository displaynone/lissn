import { GITHUB_PROJECT_URL } from "@/constants/generic";
import { Trans } from "@lingui/react/macro";
import { Linking } from "react-native";
import { Button, H1, Text, XStack, YStack } from "tamagui";
import packageData from "../../package.json";
import GithubIcon from "../icons/GithubIcon";
import Logo from "../icons/Logo";

const DrawerContent: React.FC = () => {
	return (
		<YStack p="$3" paddingTop="$8" jc="space-between" h="100%">
			<XStack jc="space-between" ai="center" gap="$4">
				<YStack gap={0} jc="space-between">
					<H1
						fontSize="$10"
						fontWeight="$2"
						// textAlign="center"
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
