import { IconProps } from "@/utils/types";
import Svg, { G, Path } from "react-native-svg";

const PlaylistIcon: React.FC<IconProps> = ({ size = 24, color = "black" }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<G strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<Path
					d="M4 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z"
					stroke={color}
				/>
				<Path
					d="M15 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z"
					stroke={color}
				/>
				<Path d="M4 15v-3a8 8 0 0 1 16 0v3" stroke={color} />
			</G>
		</Svg>
	);
};

export default PlaylistIcon;
