import ExportDBIcon from "@/components/icons/ExportDBIcon";
import ImportDBIcon from "@/components/icons/ImportDBIcon";
import Heading from "@/components/partials/Heading";
import Player from "@/components/partials/Player";
import { ActionItem } from "@/components/ui/ActionItem";
import { Text } from "@/components/ui/Text";
import { exportDatabaseJSON } from "@/utils/exportDB";
import { pickAndImportDb } from "@/utils/pickAndImportDB";
import { useLingui } from "@lingui/react/macro";
import { YStack } from "tamagui";

export default function PlaylistsScreen() {
	const { t } = useLingui();
	return (
		<YStack flex={1} gap="$2" p="$4">
			<Heading />
			<ActionItem
				icon={<ExportDBIcon color="white" size={18} />}
				title={<Text>{t`Export music database`}</Text>}
				onPress={async () => {
					exportDatabaseJSON().then(() => console.log("EXPORTED"));
				}}
			/>
			<ActionItem
				icon={<ImportDBIcon color="white" size={18} />}
				title={<Text>{t`Import music database`}</Text>}
				onPress={async () => {
					pickAndImportDb();
				}}
			/>
			<Player />
		</YStack>
	);
}
