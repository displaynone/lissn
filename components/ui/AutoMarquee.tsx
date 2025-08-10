import React, { useCallback, useEffect, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, TextProps, XStack } from "tamagui";

type Props = {
	text: string;
	playing?: boolean;
	speedPxPerSec?: number;
	gap?: number;
	delayMs?: number;
	textProps?: TextProps;
};

export const AutoMarquee: React.FC<Props> = ({
	text,
	playing = true,
	speedPxPerSec = 25,
	gap = 32,
	delayMs = 600,
	textProps,
}) => {
	const [containerW, setContainerW] = useState(0);
	const [intrinsicTextW, setIntrinsicTextW] = useState(0);

	const tx = useSharedValue(0);

	const onLayoutContainer = useCallback((e: LayoutChangeEvent) => {
		setContainerW(e.nativeEvent.layout.width);
	}, []);

	const onLayoutMeasure = useCallback((e: LayoutChangeEvent) => {
		setIntrinsicTextW(e.nativeEvent.layout.width);
	}, []);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: tx.value }],
	}));

	useEffect(() => {
		const overflow = intrinsicTextW > containerW && containerW > 0;
		if (!playing || !overflow) {
			cancelAnimation(tx);
			tx.value = 0;
			return;
		}

		let cancelled = false;

		const start = () => {
			const distance = intrinsicTextW + gap;
			const duration = Math.max(
				50,
				Math.round((distance / speedPxPerSec) * 1000)
			);

			tx.value = 0;
			setTimeout(() => {
				if (cancelled) return;
				tx.value = withTiming(
					-distance,
					{ duration, easing: Easing.linear },
					(finished) => {
						if (finished) {
							tx.value = 0;
							runOnJS(loop)();
						}
					}
				);
			}, delayMs);
		};

		const loop = () => {
			if (cancelled) return;
			start();
		};

		loop();

		return () => {
			cancelled = true;
			cancelAnimation(tx);
			tx.value = 0;
		};
	}, [containerW, intrinsicTextW, gap, speedPxPerSec, delayMs, playing, tx]);

	const overflow = intrinsicTextW > containerW && containerW > 0;

	return (
		<XStack
			w="100%"
			overflow="hidden"
			ai="center"
			onLayout={onLayoutContainer}
			position="relative"
		>
			<Animated.View
				style={[animatedStyle, { flexDirection: "row", alignItems: "center" }]}
			>
				<Text
					{...textProps}
					numberOfLines={1}
					ellipsizeMode={!playing ? "tail" : "clip"}
					w={overflow ? undefined : "100%"}
				>
					{text}
				</Text>
				{overflow && (
					<>
						<XStack w={gap} />
						<Text
							{...textProps}
							numberOfLines={1}
							ellipsizeMode={!playing ? "tail" : "clip"}
						>
							{text}
						</Text>
					</>
				)}
			</Animated.View>

			<Text
				{...textProps}
				position="absolute"
				opacity={0}
				left={-9999}
				numberOfLines={1}
				flexShrink={0 as any}
				maxWidth={"unset" as any}
				onLayout={onLayoutMeasure}
			>
				{text}
			</Text>
		</XStack>
	);
};
