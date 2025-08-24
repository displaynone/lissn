import { database } from "@/database";
import ExpoMusicLibrary, { Audio } from "@/lib/ExpoMusicLibrary";
import { Album, Artist, Genre, Song } from "@/models";
import { Q } from "@nozbe/watermelondb";

export interface SyncProgress {
	total: number;
	processed: number;
	isComplete: boolean;
	currentItem?: string;
}

export class MusicLibraryService {
	private static instance: MusicLibraryService;
	private syncInProgress = false;
	private progressCallback?: (progress: SyncProgress) => void;

	static getInstance(): MusicLibraryService {
		if (!MusicLibraryService.instance) {
			MusicLibraryService.instance = new MusicLibraryService();
		}
		return MusicLibraryService.instance;
	}

	// Main method to sync the library
	async syncLibrary(
		onProgress?: (progress: SyncProgress) => void
	): Promise<void> {
		if (this.syncInProgress) {
			console.log("🎵 Sync already in progress");
			return;
		}

		this.syncInProgress = true;
		this.progressCallback = onProgress;

		try {
			console.log("🎵 Starting music library sync...");

			// Check permissions
			const { status } = await ExpoMusicLibrary.getPermissionsAsync();
			if (status !== "granted") {
				const permission = await ExpoMusicLibrary.requestPermissionsAsync();
				if (permission.status !== "granted") {
					throw new Error("Permission denied for media library access");
				}
			}

			// Get all audio assets
			const audioAssets = await this.getAllAudioAssets();
			console.log(`🎵 Found ${audioAssets.length} audio files`);

			// Process each asset
			let processed = 0;
			for (const asset of audioAssets) {
				try {
					await this.processAudioAsset(asset);
					processed++;

					this.reportProgress({
						total: audioAssets.length,
						processed,
						isComplete: false,
						currentItem: asset.filename,
					});
				} catch (error) {
					console.warn(`Error processing asset ${asset.filename}:`, error);
				}
			}

			this.reportProgress({
				total: audioAssets.length,
				processed,
				isComplete: true,
			});

			console.log("🎵 Music library sync completed");
		} catch (error) {
			console.error("❌ Error syncing music library:", error);
			throw error;
		} finally {
			this.syncInProgress = false;
		}
	}

	// Get all audio assets
	private async getAllAudioAssets(): Promise<Audio[]> {
		const allAssets: Audio[] = [];
		let hasNextPage = true;
		let after: string | undefined;

		while (hasNextPage) {
			const result = await ExpoMusicLibrary.getAssetsAsync({
				first: 100,
				after,
				sortBy: ["creationTime DESC"],
			});

			allAssets.push(...result);
			hasNextPage = result.length === 100; // Check if we got the max number of results
			after = result[result.length - 1]?.id; // Set after to the last asset's ID for next page
		}

		return allAssets;
	}

	// Process an individual audio asset
	private async processAudioAsset(asset: Audio): Promise<void> {
		// Filter out ringtones - skip songs in ringtones folders
		if (this.isValidPath(asset.uri)) {
			return; // Skip ringtones
		}

		await database.write(async () => {
			// Check if already exists
			// It needs to use raq query because of wattermelon filtering deleted records
			const existing = await database
				.get<Song>("songs")
				.query(
					Q.unsafeSqlQuery(`select * from songs where external_id = ?`, [asset.id])
				)
				.unsafeFetchRaw();

			if (existing.length > 0) {
				return; // Already exists, don't process
			}

			// Extract metadata from filename and asset info
			const title = asset.title;
			const artistName = asset.artist;
			const albumName = asset.albumId;

			// Create or find artist
			const artist = await this.findOrCreateArtist(artistName);

			// Create or find album
			const album = await this.findOrCreateAlbum(albumName, artist.id);

			// Create the song
			await database.get<Song>("songs").create((song) => {
				song.title = title;
				song.artistId = artist.id;
				song.albumId = album.id;
				song.genreId = asset.genreId;
				song.coverPath = asset.artwork;
				song.sourceUri = asset.uri;
				song.duration = asset.duration;
				song.externalId = asset.id;
				song.isFavorite = false;
				song.playCount = 0;
			});
		});
	}

	// Check if the asset is in a ringtones folder
	private isValidPath(uri: string): boolean {
		// Regex to detect Ringtone, Notification, WhatsApp folders (case insensitive)
		const excludePattern =
			/[\/\\](ringtones?|notifications?|whatsapp|alarms|backups)[\/\\]/i;

		return excludePattern.test(uri);
	}

	// Find or create artist
	private async findOrCreateArtist(name: string): Promise<Artist> {
		const artists = await database
			.get<Artist>("artists")
			.query(Q.where("name", name))
			.fetch();

		if (artists.length > 0) {
			return artists[0];
		}

		return await database.get<Artist>("artists").create((artist) => {
			artist.name = name;
		});
	}

	// Find or create album
	private async findOrCreateAlbum(
		title: string,
		artistId: string
	): Promise<Album> {
		const albums = await database
			.get<Album>("albums")
			.query(Q.where("title", title), Q.where("artist_id", artistId))
			.fetch();

		if (albums.length > 0) {
			return albums[0];
		}

		return await database.get<Album>("albums").create((album) => {
			album.title = title;
			album.artistId = artistId;
		});
	}

	// Find or create genre
	private async findOrCreateGenre(name: string): Promise<Genre> {
		const genres = await database
			.get<Genre>("genres")
			.query(Q.where("name", name))
			.fetch();

		if (genres.length > 0) {
			return genres[0];
		}

		return await database.get<Genre>("genres").create((genre) => {
			genre.name = name;
		});
	}

	// Report progress
	private reportProgress(progress: SyncProgress): void {
		if (this.progressCallback) {
			this.progressCallback(progress);
		}
	}

	// Check if sync is in progress
	isSyncInProgress(): boolean {
		return this.syncInProgress;
	}

	// Clear entire database (useful for development)
	async clearDatabase(): Promise<void> {
		console.log("🎵 Clearing database...");
		await database.write(async () => {
			await database.unsafeResetDatabase();
			console.log("🎵 Database cleared");
		});
	}

	// Get library statistics
	async getLibraryStats() {
		const [songsCount, artistsCount, albumsCount, genresCount] =
			await Promise.all([
				database.get<Song>("songs").query().fetchCount(),
				database.get<Artist>("artists").query().fetchCount(),
				database.get<Album>("albums").query().fetchCount(),
				database.get<Genre>("genres").query().fetchCount(),
			]);

		return {
			songsCount,
			artistsCount,
			albumsCount,
			genresCount,
		};
	}
}
