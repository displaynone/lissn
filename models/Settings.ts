import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";

export const SETTINGS_KEYS = {
  LAST_SONG_ID: 'LAST_SONG_ID',
	LAST_PLAYED_AT: 'LAST_PLAYED_AT',
} as const;

export type SettingsKey = keyof typeof SETTINGS_KEYS;

export class Settings extends Model {
	static table = "settings";

	@field("key") key!: SettingsKey;
	@field("value") value?: string;
}
