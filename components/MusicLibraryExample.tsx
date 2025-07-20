import { useMusicLibrary } from "@/hooks/providers/MusicProvider";
import { Song } from "@/models";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MusicLibraryExampleProps {
	// Optional props
}

export const MusicLibraryExample: React.FC<MusicLibraryExampleProps> = () => {
	const {
		// State
		songs,
		artists,
		albums,
		isLoading,
		syncProgress,
		isSyncing,

		// CRUD operations
		getSongById,
		toggleFavorite,
		incrementPlayCount,

		// Search and filtering
		searchSongs,
		getFavoriteSongs,
		getRecentlyPlayed,

		// Sync control
		startSync,
		clearDatabase,
		getLibraryStats,
	} = useMusicLibrary();

	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Song[]>([]);
	const [stats, setStats] = useState<any>(null);
	const [favorites, setFavorites] = useState<Song[]>([]);

	// Load statistics on initialization
	useEffect(() => {
		loadStats();
	}, [songs]);

	// Load favorites
	useEffect(() => {
		loadFavorites();
	}, [songs]);

	const loadStats = async () => {
		const libraryStats = await getLibraryStats();
		setStats(libraryStats);
	};

	const loadFavorites = async () => {
		const favoriteSongs = await getFavoriteSongs();
		setFavorites(favoriteSongs);
	};

	const handleSearch = async () => {
		if (searchQuery.trim()) {
			const results = await searchSongs(searchQuery);
			setSearchResults(results);
		} else {
			setSearchResults([]);
		}
	};

	const handleToggleFavorite = async (songId: string) => {
		await toggleFavorite(songId);
		// Observers will automatically update the state
	};

	const handlePlaySong = async (songId: string) => {
		await incrementPlayCount(songId);
		// Here you could add logic to play the song
		console.log("Playing song:", songId);
	};

	const handleStartSync = async () => {
		if (!isSyncing) {
			await startSync();
		}
	};

	const handleClearDatabase = async () => {
		await clearDatabase();
	};

	const renderSongItem = ({ item: song }: { item: Song }) => (
		<View
			style={{
				padding: 12,
				borderBottomWidth: 1,
				borderBottomColor: "#e0e0e0",
				backgroundColor: song.isFavorite ? "#fff3e0" : "transparent",
			}}
		>
			<Text style={{ fontSize: 16, fontWeight: "bold" }}>{song.title}</Text>
			<Text style={{ color: "#666", marginTop: 4 }}>
				Plays: {song.playCount} | Favorite: {song.isFavorite ? "❤️" : "🤍"}
			</Text>

			<View style={{ flexDirection: "row", marginTop: 8 }}>
				<TouchableOpacity
					onPress={() => handlePlaySong(song.id)}
					style={{
						backgroundColor: "#007AFF",
						paddingHorizontal: 12,
						paddingVertical: 6,
						borderRadius: 4,
						marginRight: 8,
					}}
				>
					<Text style={{ color: "white", fontSize: 12 }}>▶️ Play</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => handleToggleFavorite(song.id)}
					style={{
						backgroundColor: song.isFavorite ? "#FF3B30" : "#34C759",
						paddingHorizontal: 12,
						paddingVertical: 6,
						borderRadius: 4,
					}}
				>
					<Text style={{ color: "white", fontSize: 12 }}>
						{song.isFavorite ? "💔 Unfav" : "❤️ Fav"}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	if (isLoading && songs.length === 0) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
				<Text style={{ marginTop: 16 }}>Loading music library...</Text>
			</View>
		);
	}

	return (
		<View style={{ flex: 1, padding: 16 }}>
			{/* Header with statistics */}
			<View style={{ marginBottom: 20 }}>
				<Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
					Music Library
				</Text>

				{stats && (
					<Text style={{ color: "#666" }}>
						{stats.songsCount} songs • {stats.artistsCount} artists •{" "}
						{stats.albumsCount} albums
					</Text>
				)}
			</View>

			{/* Sync control */}
			<View style={{ flexDirection: "row", marginBottom: 16 }}>
				<TouchableOpacity
					onPress={handleStartSync}
					disabled={isSyncing}
					style={{
						backgroundColor: isSyncing ? "#ccc" : "#007AFF",
						paddingHorizontal: 16,
						paddingVertical: 8,
						borderRadius: 6,
						marginRight: 8,
					}}
				>
					<Text style={{ color: "white" }}>
						{isSyncing ? "Syncing..." : "🔄 Sync Library"}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={handleClearDatabase}
					style={{
						backgroundColor: "#FF3B30",
						paddingHorizontal: 16,
						paddingVertical: 8,
						borderRadius: 6,
					}}
				>
					<Text style={{ color: "white" }}>🗑️ Clear DB</Text>
				</TouchableOpacity>
			</View>

			{/* Sync progress */}
			{syncProgress && (
				<View
					style={{
						marginBottom: 16,
						padding: 12,
						backgroundColor: "#f0f0f0",
						borderRadius: 6,
					}}
				>
					<Text>
						Sync Progress: {syncProgress.processed}/{syncProgress.total}
					</Text>
					{syncProgress.currentItem && (
						<Text style={{ fontSize: 12, color: "#666" }}>
							Processing: {syncProgress.currentItem}
						</Text>
					)}
				</View>
			)}

			{/* Search */}
			<View style={{ marginBottom: 16 }}>
				<TextInput
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholder="Search songs..."
					style={{
						borderWidth: 1,
						borderColor: "#ddd",
						borderRadius: 6,
						paddingHorizontal: 12,
						paddingVertical: 8,
						marginBottom: 8,
					}}
				/>
				<TouchableOpacity
					onPress={handleSearch}
					style={{
						backgroundColor: "#34C759",
						paddingHorizontal: 16,
						paddingVertical: 8,
						borderRadius: 6,
						alignSelf: "flex-start",
					}}
				>
					<Text style={{ color: "white" }}>🔍 Search</Text>
				</TouchableOpacity>
			</View>

			{/* Results */}
			<FlatList
				data={searchResults.length > 0 ? searchResults : songs.slice(0, 20)} // Show first 20 songs by default
				renderItem={renderSongItem}
				keyExtractor={(item) => item.id}
				ListHeaderComponent={() => (
					<Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
						{searchResults.length > 0
							? `Search Results (${searchResults.length})`
							: `Recent Songs (${Math.min(songs.length, 20)})`}
					</Text>
				)}
				ListEmptyComponent={() => (
					<Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
						No songs found. Try syncing your library!
					</Text>
				)}
			/>
		</View>
	);
};

export default MusicLibraryExample;
