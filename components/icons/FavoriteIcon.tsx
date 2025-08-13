import { IconProps } from "@/utils/types";
import Svg, { G, Path } from "react-native-svg";

type FavoriteIconProps = {
	filled?: boolean;
};

const FavoriteIcon: React.FC<IconProps & FavoriteIconProps> = ({
	size = 24,
	color = "black",
	filled = false,
}) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<G strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<Path
					d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
					stroke={color}
					fill={filled ? color : undefined}
				/>
			</G>
		</Svg>
	);
};

export default FavoriteIcon;
