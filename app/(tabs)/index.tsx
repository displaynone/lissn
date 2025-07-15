import { Platform, StyleSheet } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Loading } from "@/components/ui/Loading";
import { useMusicLibrary } from "@/hooks/providers/MusicProvider";
import { ScrollView } from "tamagui";

export default function HomeScreen() {
	const { songs: listOfSongs, isLoading } = useMusicLibrary();

	if (isLoading) {
		return <Loading />;
	}

	return (
		<ScrollView>
			{listOfSongs.map((song) => (
				<ThemedView key={song.id} style={styles.stepContainer}>
					<ThemedText style={styles.titleContainer}>
						<HelloWave />
						<ThemedText>{song.title}</ThemedText>
						<ThemedText>{song.artist}</ThemedText>
					</ThemedText>
					<ThemedText>{song.album}</ThemedText>
					{song.coverPath && (
						<ThemedView
							style={{
								width: 100,
								height: 100,
								borderRadius: 8,
								overflow: "hidden",
							}}
						>
							<ThemedView
								style={{
									width: "100%",
									height: "100%",
									backgroundColor: "transparent",
								}}
							>
								{Platform.OS === "web" ? (
									<img
										src={song.coverPath}
										style={{ width: "100%", height: "100%" }}
										alt="Cover"
									/>
								) : (
									<ThemedView
										style={{
											width: "100%",
											height: "100%",
											backgroundColor: "transparent",
										}}
									>
										<ThemedView
											style={{
												width: "100%",
												height: "100%",
												backgroundColor: `url(${song.coverPath})`,
												backgroundSize: "cover",
											}}
										/>
									</ThemedView>
								)}
							</ThemedView>
						</ThemedView>
					)}
				</ThemedView>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: "absolute",
	},
});
