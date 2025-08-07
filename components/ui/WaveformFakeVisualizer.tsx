import { tamaguiConfig } from "@/tamagui.config";
import { YStack } from "tamagui";
import { BarAnimated } from "./BarAnimated";

type WaveformFakeVisualizerProps = {
	barCount?: number;
	barWidth?: number;
	barHeight?: number;
	color?: string;
	isPlaying: boolean;
};

export const WaveformFakeVisualizer: React.FC<WaveformFakeVisualizerProps> = ({
	barCount = 3,
	barWidth = 4,
	barHeight = 20,
	color = tamaguiConfig.tokens.color.primary.val,
	isPlaying,
}) => {
	return (
		<YStack ai="center" jc="center" fd="row" gap="$1">
			{Array.from({ length: barCount }).map((_, index) => (
				<BarAnimated
					key={index}
					width={barWidth}
					maxHeight={barHeight}
					color={color}
					isPlaying={isPlaying}
				/>
			))}
		</YStack>
	);
};
