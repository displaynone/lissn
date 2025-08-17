import { useState } from "react";
import { StyleSheet, View } from "react-native";
import FastImage, { ImageStyle } from "react-native-fast-image";
import MissingCoverIcon from "../icons/MissingCoverIcon";

type CoverProps = {
	coverPath: string;
	size?: number;
	alternativeCoverOpacity?: number;
	style?: Partial<ImageStyle>;
	resizeMode?: keyof typeof FastImage.resizeMode;
	showDefault?: boolean;
	borderRadius?: number;
	onLoad?: () => void;
};

const Cover: React.FC<CoverProps> = ({
	coverPath,
	size = 64,
	alternativeCoverOpacity = 0.2,
	style = {},
	resizeMode = "cover",
	showDefault = true,
	borderRadius = 8,
	onLoad,
}) => {
	const [isError, setIsError] = useState(false);

	const imageStyle: ImageStyle = {
		width: size,
		height: size,
		borderRadius,
		overflow: "hidden",
		backgroundColor: "transparent",
		...(style as ImageStyle),
	};

	return (
		<View style={[imageStyle]}>
			{showDefault && (isError || !coverPath) && (
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
			)}
			<FastImage
				style={imageStyle}
				source={{ uri: coverPath }}
				resizeMode={FastImage.resizeMode[resizeMode]}
				onError={() => {
					setIsError(true);
					onLoad?.();
				}}
				onLoad={() => {
					onLoad?.();
				}}
			/>
		</View>
	);
};

export default Cover;
