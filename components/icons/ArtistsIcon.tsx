import { IconProps } from "@/utils/types";
import Svg, { G, Path } from "react-native-svg";

const ArtistsIcon: React.FC<IconProps> = ({ size = 24, color = "black" }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<G strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<Path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" stroke={color} />
				<Path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" stroke={color} />
				<Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} />
				<Path d="M21 21v-2a4 4 0 0 0 -3 -3.85" stroke={color} />
			</G>
		</Svg>
	);
};

export default ArtistsIcon;
