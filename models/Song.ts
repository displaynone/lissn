import { Model } from "@nozbe/watermelondb";
import { date, field, readonly } from "@nozbe/watermelondb/decorators";

export class Song extends Model {
	static table = "songs";

	@field("title") title!: string;
	@field("artist_id") artistId!: string;
	@field("album_id") albumId!: string;
	@field("genre_id") genreId?: string;
	@field("cover_path") coverPath?: string;
	@field("source_uri") sourceUri!: string;
	@field("duration") duration?: number;
	@field("track_number") trackNumber?: number;
	@field("external_id") externalId?: string;
	@field("file_size") fileSize?: number;
	@field("is_favorite") isFavorite!: boolean;
	@field("play_count") playCount!: number;
	@field("last_played_at") lastPlayedAt?: number;
	@readonly @date("created_at") createdAt!: Date;
	@readonly @date("updated_at") updatedAt!: Date;

	// Helper methods
	async incrementPlayCount() {
		return this.database.write(async () => {
			await this.update((song) => {
				song.playCount = song.playCount + 1;
				song.lastPlayedAt = Date.now();
			});
		});
	}

	async toggleFavorite() {
		return this.database.write(async () => {
			await this.update((song) => {
				song.isFavorite = !song.isFavorite;
			});
		});
	}
}
