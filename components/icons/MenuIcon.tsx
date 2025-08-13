import { IconProps } from "@/utils/types";
import Svg, { G, Path } from "react-native-svg";

// https://tabler.io/icons
const MenuIcon: React.FC<IconProps> = ({ size = 24, color = "black" }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<G
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				stroke={color}
			>
				<Path d="M7 6h10" />
				<Path d="M4 12h16" />
				<Path d="M7 12h13" />
				<Path d="M7 18h10" />
			</G>
		</Svg>
	);
};

export default MenuIcon;
