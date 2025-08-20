import { setToastData } from "@/store/appStore";
import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import * as DocumentPicker from "expo-document-picker";
import { importDatabaseJSON } from "./importDB";

export async function pickAndImportDb() {
	try {
		const result = await DocumentPicker.getDocumentAsync({
			type: "application/json", // solo JSON
			copyToCacheDirectory: true,
		});

		if (result.canceled) {
			setToastData({
				title: t`Import database`,
				message: t`Selection canceled`,
				duration: 3000,
			});
			return;
		}

		const file = result.assets[0];

		// Llamar a tu importador
		await importDatabaseJSON(file.uri, "merge");
		setToastData({
			title: t`Import database`,
			message: t`Database imported successfully`,
			duration: 3000,
		});
	} catch (err) {
		setToastData({
			title: t`Import database`,
			message: i18n._(
				{
					id: "error.importing_db",
					message: "Error selecting or importing: {error}",
					values:{
						error:(err instanceof Error ? err.message : String(err))
					}
				}),
			duration: 3000,
		});
	}
}
