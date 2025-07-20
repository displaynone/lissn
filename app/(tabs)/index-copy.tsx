import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Loading } from "@/components/ui/Loading";
import { useMusicLibrary } from "@/hooks/providers/MusicProvider";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";
import { Button, ScrollView, XStack, YStack } from "tamagui";

export default function HomeScreen() {
	const {
		songs: listOfSongs,
		artists,
		albums,
		isLoading,
		isSyncing,
		startSync,
		toggleFavorite,
		incrementPlayCount,
		syncProgress,
		clearDatabase,
		isRecovering,
		recoveryMessage,
	} = useMusicLibrary();

	const [searchQuery, setSearchQuery] = useState("");
	const [showDebugTools, setShowDebugTools] = useState(false);

	// Helper function to get artist name by ID
	const getArtistName = useCallback(
		(artistId: string) => {
			const artist = artists.find((a) => a.id === artistId);
			return artist?.name || "Unknown Artist";
		},
		[artists]
	);

	// Helper function to get album title by ID
	const getAlbumTitle = useCallback(
		(albumId: string) => {
			const album = albums.find((a) => a.id === albumId);
			return album?.title || "Unknown Album";
		},
		[albums]
	);

	// Format duration from milliseconds to MM:SS
	const formatDuration = (duration?: number) => {
		if (!duration) return "0:00";
		const minutes = Math.floor(duration / 60000);
		const seconds = Math.floor((duration % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	// Filter songs based on search query
	const filteredSongs = useMemo(() => {
		if (!searchQuery.trim()) return listOfSongs;

		return listOfSongs.filter(
			(song) =>
				song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				getArtistName(song.artistId)
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				getAlbumTitle(song.albumId)
					.toLowerCase()
					.includes(searchQuery.toLowerCase())
		);
	}, [searchQuery, listOfSongs, getArtistName, getAlbumTitle]);

	const handlePlaySong = async (song: any) => {
		await incrementPlayCount(song.id);
		console.log(`Playing: ${song.title} by ${getArtistName(song.artistId)}`);
	};

	const handleToggleFavorite = async (song: any) => {
		await toggleFavorite(song.id);
	};

	const handleClearDatabase = async () => {
		await clearDatabase();
		setShowDebugTools(false);
	};

	// Auto-recovery state
	if (isRecovering) {
		return (
			<ThemedView style={styles.container}>
				<Loading />
				<ThemedText style={styles.loadingText}>
					🔄 Recuperación Automática
				</ThemedText>
				{!!recoveryMessage && (
					<ThemedText style={styles.subText}>{recoveryMessage}</ThemedText>
				)}
				<ThemedText style={styles.debugText}>
					La app detectó un problema y está solucionándolo automáticamente
				</ThemedText>
			</ThemedView>
		);
	}

	if (isLoading) {
		return (
			<ThemedView style={styles.container}>
				<Loading />
				<ThemedText style={styles.loadingText}>
					Cargando biblioteca de música...
				</ThemedText>
			</ThemedView>
		);
	}

	if (isSyncing && syncProgress) {
		return (
			<ThemedView style={styles.container}>
				<Loading />
				<ThemedText style={styles.loadingText}>
					Sincronizando: {syncProgress.processed}/{syncProgress.total}
				</ThemedText>
				{!!syncProgress.currentItem && (
					<ThemedText style={styles.subText}>
						{syncProgress.currentItem}
					</ThemedText>
				)}
			</ThemedView>
		);
	}

	return (
		<ScrollView style={styles.container}>
			<ThemedView style={styles.header}>
				<XStack alignItems="center" gap="$2" marginBottom="$4">
					<HelloWave />
					<ThemedText style={styles.title}>Mi Biblioteca Musical!</ThemedText>
				</XStack>

				<ThemedText style={styles.statsText}>
					{filteredSongs.length} canciones encontradas
				</ThemedText>

				{/* Recovery status message */}
				{!!recoveryMessage && (
					<YStack
						gap="$2"
						padding="$3"
						backgroundColor="rgba(0, 255, 0, 0.1)"
						borderRadius="$3"
						marginTop="$2"
						marginBottom="$2"
					>
						<ThemedText style={styles.recoveryText}>
							✅ {recoveryMessage}
						</ThemedText>
					</YStack>
				)}

				{/* Debug Tools - Now simplified since recovery is automatic */}
				<XStack gap="$2" marginTop="$2" marginBottom="$2">
					<Button
						size="$2"
						variant="outlined"
						onPress={() => setShowDebugTools(!showDebugTools)}
					>
						{showDebugTools ? "Ocultar" : "Herramientas"}
					</Button>
				</XStack>

				{showDebugTools && (
					<YStack
						gap="$2"
						padding="$3"
						backgroundColor="rgba(255, 255, 255, 0.05)"
						borderRadius="$3"
						marginBottom="$3"
					>
						<ThemedText style={styles.debugTitle}>
							Herramientas Manuales
						</ThemedText>
						<XStack gap="$2">
							<Button
								size="$3"
								backgroundColor="$red9"
								onPress={handleClearDatabase}
								disabled={isSyncing || isRecovering}
							>
								Limpiar DB
							</Button>
							<Button
								size="$3"
								onPress={startSync}
								disabled={isSyncing || isRecovering}
							>
								Sincronizar
							</Button>
						</XStack>
						<ThemedText style={styles.debugText}>
							🔄 La app ahora se recupera automáticamente de errores de base de
							datos
						</ThemedText>
						<ThemedText style={styles.debugText}>
							💡 Solo usa estas herramientas si necesitas intervención manual
						</ThemedText>
					</YStack>
				)}

				{listOfSongs.length === 0 && (
					<YStack gap="$3" marginTop="$4">
						<ThemedText style={styles.emptyText}>
							No hay canciones en tu biblioteca
						</ThemedText>
						<Button onPress={startSync} disabled={isSyncing || isRecovering}>
							{isSyncing ? "Sincronizando..." : "Sincronizar Biblioteca"}
						</Button>
					</YStack>
				)}
			</ThemedView>

			{filteredSongs.map((song, index) => (
				<Pressable
					key={song.id}
					onPress={() => handlePlaySong(song)}
					style={({ pressed }) => [
						styles.songContainer,
						pressed && styles.songPressed,
					]}
				>
					<ThemedView style={styles.songItem}>
						{/* Album Art */}
						<ThemedView style={styles.albumArtContainer}>
							{!!song.coverPath && (
								<FastImage
									style={{ width: 100, height: 100 }}
									source={{
										uri: song.coverPath,
									}}
									resizeMode={FastImage.resizeMode.cover}
								/>
							)}
							{!song.coverPath && (
								<ThemedView style={[styles.albumArt, styles.noArtwork]}>
									<ThemedText style={styles.noArtworkText}>♪</ThemedText>
								</ThemedView>
							)}
						</ThemedView>

						{/* Song Info */}
						<ThemedView style={styles.songInfo}>
							<ThemedText style={styles.songTitle} numberOfLines={1}>
								{song.title}
							</ThemedText>
							<ThemedText style={styles.artistName} numberOfLines={1}>
								{getArtistName(song.artistId)}
							</ThemedText>
							<ThemedText style={styles.albumName} numberOfLines={1}>
								{getAlbumTitle(song.albumId)}
							</ThemedText>
						</ThemedView>

						{/* Song Details */}
						<ThemedView style={styles.songDetails}>
							<ThemedText style={styles.duration}>
								{formatDuration(song.duration)}
							</ThemedText>
							{song.trackNumber && (
								<ThemedText style={styles.trackNumber}>
									#{song.trackNumber}
								</ThemedText>
							)}
							<ThemedText style={styles.playCount}>
								▶ {song.playCount}
							</ThemedText>
						</ThemedView>

						{/* Favorite Button */}
						<Pressable
							onPress={() => handleToggleFavorite(song)}
							style={styles.favoriteButton}
						>
							<ThemedText
								style={[
									styles.favoriteIcon,
									song.isFavorite && styles.favoriteActive,
								]}
							>
								{song.isFavorite ? "❤️" : "🤍"}
							</ThemedText>
						</Pressable>
					</ThemedView>
				</Pressable>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	header: {
		marginBottom: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
	},
	statsText: {
		fontSize: 14,
		opacity: 0.7,
	},
	recoveryText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#4CAF50",
	},
	debugTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
	},
	debugText: {
		fontSize: 12,
		opacity: 0.7,
		marginTop: 4,
	},
	emptyText: {
		fontSize: 16,
		textAlign: "center",
		opacity: 0.7,
	},
	loadingText: {
		fontSize: 16,
		textAlign: "center",
		marginTop: 16,
	},
	subText: {
		fontSize: 14,
		textAlign: "center",
		opacity: 0.7,
		marginTop: 8,
	},
	songContainer: {
		marginBottom: 2,
	},
	songPressed: {
		opacity: 0.7,
	},
	songItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 8,
		backgroundColor: "rgba(255, 255, 255, 0.05)",
	},
	albumArtContainer: {
		marginRight: 12,
	},
	albumArt: {
		width: 50,
		height: 50,
		borderRadius: 6,
		overflow: "hidden",
	},
	noArtwork: {
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		justifyContent: "center",
		alignItems: "center",
	},
	noArtworkText: {
		fontSize: 20,
		opacity: 0.5,
	},
	songInfo: {
		flex: 1,
		marginRight: 12,
	},
	songTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 2,
	},
	artistName: {
		fontSize: 14,
		opacity: 0.8,
		marginBottom: 2,
	},
	albumName: {
		fontSize: 12,
		opacity: 0.6,
	},
	songDetails: {
		alignItems: "flex-end",
		marginRight: 12,
	},
	duration: {
		fontSize: 12,
		opacity: 0.7,
		marginBottom: 2,
	},
	trackNumber: {
		fontSize: 11,
		opacity: 0.5,
		marginBottom: 2,
	},
	playCount: {
		fontSize: 11,
		opacity: 0.5,
	},
	favoriteButton: {
		padding: 4,
	},
	favoriteIcon: {
		fontSize: 20,
	},
	favoriteActive: {
		// El emoji ya tiene color, no necesita estilo adicional
	},
});
