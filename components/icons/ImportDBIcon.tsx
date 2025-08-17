import { IconProps } from "@/utils/types";
import Svg, { G, Path } from "react-native-svg";

// https://tabler.io/icons
const ImportDBIcon: React.FC<IconProps> = ({ size = 24, color = "black" }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<G
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				stroke={color}
			>
					<Path d="M4 6c0 1.657 3.582 3 8 3s8 -1.343 8 -3s-3.582 -3 -8 -3s-8 1.343 -8 3" />
					<Path d="M4 6v6c0 1.657 3.582 3 8 3c.856 0 1.68 -.05 2.454 -.144m5.546 -2.856v-6" />
					<Path d="M4 12v6c0 1.657 3.582 3 8 3c.171 0 .341 -.002 .51 -.006" />
					<Path d="M19 22v-6" />
					<Path d="M22 19l-3 -3l-3 3" />
			</G>
		</Svg>
	);
};

export default ImportDBIcon;
