import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { View } from "tamagui";

type BarAnimatedProps = {
  width: number;
  maxHeight: number;
  color: string;
  isPlaying: boolean;
};

export const BarAnimated: React.FC<BarAnimatedProps> = ({
  width,
  maxHeight,
  color,
  isPlaying,
}) => {
  const targetHeight = useSharedValue(maxHeight * 0.2);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(targetHeight.value, {
      duration: 300,
      easing: Easing.linear,
    }),
  }));

  useEffect(() => {
    let intervalId: number;

    if (isPlaying) {
      intervalId = setInterval(() => {
        targetHeight.value = Math.random() * maxHeight * 0.8 + maxHeight * 0.2;
      }, 300);
    } else {
      targetHeight.value = maxHeight * 0.2;
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying, maxHeight, targetHeight]);

  return (
    <View
      style={{
        width,
        height: maxHeight,
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            backgroundColor: color,
            borderRadius: 1,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};
