import { ScrollView, Text } from "tamagui";

export default function HomeScreen() {
	return (
		<ScrollView
			padding="$2"
			flex={1}
			contentContainerStyle={{
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: "#f00",
				flexGrow: 1,
				minHeight: "100%",
			}}
		>
			<Text fontSize="$6" fontWeight="bold">
				Mi Título
			</Text>
		</ScrollView>
	);
}
