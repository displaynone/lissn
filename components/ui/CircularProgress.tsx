import { tamaguiConfig } from "@/tamagui.config";
import { StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COVER_STROKE_WIDTH } from "../partials/Player";

type CircularProgressProps = {
	size: number;
	strokeWidth?: number;
	progress: number;
	color?: string;
	backgroundColor?: string;
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
	size,
	strokeWidth = COVER_STROKE_WIDTH,
	progress,
	color = tamaguiConfig.tokens.color.primary.val,
	backgroundColor = "transparent",
}) => {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference * (1 - progress / 100);

	return (
		<Svg width={size} height={size} style={styles.svg}>
			<Circle
				stroke={backgroundColor}
				fill="none"
				cx={size / 2}
				cy={size / 2}
				r={radius}
				strokeWidth={strokeWidth}
			/>
			<Circle
				stroke={color}
				fill="none"
				cx={size / 2}
				cy={size / 2}
				r={radius}
				strokeWidth={strokeWidth}
				strokeDasharray={`${circumference}, ${circumference}`}
				strokeDashoffset={strokeDashoffset}
				strokeLinecap="round"
				transform={`rotate(-90 ${size / 2} ${size / 2})`}
			/>
		</Svg>
	);
};

const styles = StyleSheet.create({
	svg: {
		position: "absolute",
		top: -1 * COVER_STROKE_WIDTH,
		left: -1 * COVER_STROKE_WIDTH,
	},
});
