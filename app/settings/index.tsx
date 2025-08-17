import ExportDBIcon from "@/components/icons/ExportDBIcon";
import ImportDBIcon from "@/components/icons/ImportDBIcon";
import Heading from "@/components/partials/Heading";
import Player from "@/components/partials/Player";
import { ActionItem } from "@/components/ui/ActionItem";
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
				title={t`Export music database`}
				onPress={async () => {
					exportDatabaseJSON().then(() => console.log("EXPORTED"));
				}}
			/>
			<ActionItem
				icon={<ImportDBIcon color="white" size={18} />}
				title={t`Import music database`}
				onPress={async () => {
					pickAndImportDb();
				}}
			/>
			<Player />
		</YStack>
	);
}
