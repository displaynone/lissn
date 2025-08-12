import { IconProps } from "@/utils/types";
import Svg, { G, Path } from "react-native-svg";

const SongsIcon: React.FC<IconProps> = ({ size = 24, color = "black" }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<G strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<Path d="M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" stroke={color} />
				<Path d="M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" stroke={color} />
				<Path d="M9 17v-13h10v13" stroke={color} />
				<Path d="M9 8h10" stroke={color} />
			</G>
		</Svg>
	);
};

export default SongsIcon;
