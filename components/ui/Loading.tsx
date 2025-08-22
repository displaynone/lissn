import { Spinner, YStack } from "tamagui";

type LoadingProps = {
	size?: "small" | "large" | undefined;
};

export const Loading: React.FC<LoadingProps> = ({ size = "large" }) => {
	return (
		<YStack f={1} jc="center" ai="center" bg="$background">
			<Spinner size={size} color="$orange10" />
		</YStack>
	);
};
