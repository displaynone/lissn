import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";
import FastImage, { ImageStyle } from "react-native-fast-image";
import MissingCoverIcon from "../icons/MissingCoverIcon";

type CoverProps = {
	coverPath: string;
	size?: number;
	alternativeCoverOpacity?: number;
	style?: Partial<ImageStyle>;
	resizeMode?: keyof typeof FastImage.resizeMode;
	blurRadius?: number;
};

const Cover: React.FC<CoverProps> = ({
	coverPath,
	size = 64,
	alternativeCoverOpacity = 0.2,
	style = {},
	resizeMode = "cover",
	blurRadius = 0,
}) => {
	const imageStyle: ImageStyle = {
		width: size,
		height: size,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: "transparent",
		...(style as ImageStyle),
	};

	return (
		<View style={[imageStyle]}>
			<View
				style={[
					StyleSheet.absoluteFillObject,
					{
						opacity: alternativeCoverOpacity,
						justifyContent: "center",
						alignItems: "center",
						borderRadius: 8,
					},
				]}
			>
				<MissingCoverIcon size={size} />
			</View>
			<FastImage
				style={imageStyle}
				source={{ uri: coverPath }}
				resizeMode={FastImage.resizeMode[resizeMode]}
			/>
			<BlurView
				intensity={blurRadius}
				tint="dark"
				style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
				experimentalBlurMethod="dimezisBlurView"
			></BlurView>
		</View>
	);
};

export default Cover;
