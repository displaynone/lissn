import { IconProps } from "@/utils/types";
import Svg, { G, Path } from "react-native-svg";

// https://tabler.io/icons
const SearchIcon: React.FC<IconProps> = ({ size = 24, color = "black" }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<G
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				stroke={color}
			>
				<Path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
				<Path d="M21 21l-6 -6" />
			</G>
		</Svg>
	);
};

export default SearchIcon;
