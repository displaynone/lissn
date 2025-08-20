import { IconProps } from "@/utils/types";
import Svg, { G, Path } from "react-native-svg";

// https://tabler.io/icons
const CloseIcon: React.FC<IconProps> = ({ size = 24, color = "black" }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<G
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				stroke={color}
			>
					<Path d="M18 6l-12 12" />
					<Path d="M6 6l12 12" />
			</G>
		</Svg>
	);
};

export default CloseIcon;
