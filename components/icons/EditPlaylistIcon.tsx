import { IconProps } from "@/utils/types";
import Svg, { Path } from "react-native-svg";

// https://tabler.io/icons
const EditPlaylistIcon: React.FC<IconProps> = ({
	size = 24,
	color = "black",
}) => {
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
		>
			<Path d="M14 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" fill={color} />
			<Path d="M17 17v-13h4" />
			<Path d="M13 5h-10" />
			<Path d="M3 9l10 0" />
			<Path d="M9 13h-6" />
		</Svg>
	);
};

export default EditPlaylistIcon;
