import { IconProps } from "@/utils/types";
import Svg, { G, Path } from "react-native-svg";

// https://tabler.io/icons
const PlaylistAddIcon: React.FC<IconProps> = ({
	size = 24,
	color = "black",
}) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<G
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				stroke={color}
			>
				<Path d="M19 8h-14" />
				<Path d="M5 12h9" />
				<Path d="M11 16h-6" />
				<Path d="M15 16h6" />
				<Path d="M18 13v6" />
			</G>
		</Svg>
	);
};

export default PlaylistAddIcon;
