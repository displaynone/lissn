import FastImage from "react-native-fast-image";
import { View } from "tamagui";
import MissingCoverIcon from "../icons/MissingCoverIcon";

type CoverProps = {
	coverPath: string;
	size?: number;
	alternativeCoverOpacity?: number;
};

const Cover: React.FC<CoverProps> = ({
	coverPath,
	size = 64,
	alternativeCoverOpacity = 0.2,
}) => {
	return (
		<View style={{ width: size, height: size, borderRadius: 8 }}>
			<View
				style={{
					width: size,
					height: size,
					borderRadius: 8,
					position: "absolute",
					opacity: alternativeCoverOpacity,
				}}
			>
				<MissingCoverIcon size={size} />
			</View>
			<FastImage
				style={{ width: size, height: size, borderRadius: 8 }}
				source={{
					uri: coverPath,
				}}
				resizeMode={FastImage.resizeMode.cover}
			/>
		</View>
	);
};

export default Cover;
