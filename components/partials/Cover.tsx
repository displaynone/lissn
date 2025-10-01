import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import MissingCoverIcon from "../icons/MissingCoverIcon";

type CoverProps = {
  coverPath: string;
  size?: number;
  alternativeCoverOpacity?: number;
  style?: any;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  showDefault?: boolean;
  borderRadius?: number;
  onLoad?: () => void;
};

const fastToExpoFit: Record<NonNullable<CoverProps["resizeMode"]>, "cover" | "contain" | "fill" | "scale-down"> = {
  cover: "cover",
  contain: "contain",
  stretch: "fill",
  center: "contain",
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

  const imageStyle = useMemo(
    () => ({
      width: size,
      height: size,
      borderRadius,
      overflow: "hidden" as const,
      backgroundColor: "transparent",
      ...(style || {}),
    }),
    [size, borderRadius, style]
  );

  const showFallback = showDefault && (isError || !coverPath);

  return (
    <View style={[imageStyle]}>
      {showFallback && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity: alternativeCoverOpacity,
              justifyContent: "center",
              alignItems: "center",
              borderRadius,
            },
          ]}
        >
          <MissingCoverIcon size={size} />
        </View>
      )}

      {!!coverPath && (
        <Image
          style={imageStyle}
          source={{ uri: coverPath }}
          contentFit={fastToExpoFit[resizeMode]}
          cachePolicy="memory-disk"
          transition={100}
          onError={() => {
            setIsError(true);
            onLoad?.();
          }}
          onLoad={() => {
            onLoad?.();
          }}
          recyclingKey={coverPath}
        />
      )}
    </View>
  );
};

export default Cover;
