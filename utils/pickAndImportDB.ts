import * as DocumentPicker from "expo-document-picker";
import { importDatabaseJSON } from "./importDB";

export async function pickAndImportDb() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json", // solo JSON
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      console.log("Selección cancelada");
      return;
    }

    const file = result.assets[0];
    console.log("Fichero seleccionado:", file.uri);

    // Llamar a tu importador
    await importDatabaseJSON(file.uri, "merge");
    console.log("Base de datos importada correctamente ✅");
  } catch (err) {
    console.error("Error al seleccionar o importar:", err);
  }
}
