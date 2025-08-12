import { IconProps } from "@/utils/types";
import Svg, { G, Path } from "react-native-svg";

// https://tabler.io/icons
const HomeIcon: React.FC<IconProps> = ({ size = 24, color = "black" }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<G strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<Path d="M5 12l-2 0l9 -9l9 9l-2 0" stroke={color} />
				<Path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" stroke={color} />
				<Path d="M10 12h4v4h-4z" stroke={color} />
			</G>
		</Svg>
	);
};

export default HomeIcon;
