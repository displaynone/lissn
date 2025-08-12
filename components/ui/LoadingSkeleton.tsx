import { backgroundSkeleton } from "@/constants/generic";
import { LinearGradient } from "@tamagui/linear-gradient";
import { View } from "tamagui";

type LoadingSkeletonProps = {
	height?: number;
};

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ height = 100 }) => {
	return (
		<View p="$3">
			<View
				w="100%"
				h={height}
				br={"$3"}
				overflow="hidden"
				backgroundColor="$backgroundTransparent05"
			>
				<LinearGradient
					colors={backgroundSkeleton}
					start={[0, 0.5]}
					end={[1, 1]}
					w="100%"
					h="100%"
				/>
			</View>
		</View>
	);
};

export default LoadingSkeleton;
