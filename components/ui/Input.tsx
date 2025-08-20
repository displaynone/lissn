// ui/AppInput.ts
import { useRef } from "react";
import {
	findNodeHandle,
	NativeSyntheticEvent,
	TextInputChangeEventData,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Button, Input as TamaguiInput, XStack } from "tamagui";
import CloseIcon from "../icons/CloseIcon";

function makeTextInputChangeEvent(
	text: string,
	node: any
): NativeSyntheticEvent<TextInputChangeEventData> {
	const handle = findNodeHandle(node) ?? 0;

	// Solo definimos nativeEvent y luego casteamos
	const e = {
		nativeEvent: {
			text,
			eventCount: 1,
			target: handle, // <-- aquí sí es number
		},
	} as unknown as NativeSyntheticEvent<TextInputChangeEventData>;

	return e;
}

type InputProps = React.ComponentProps<typeof TamaguiInput>;

export const Input: React.FC<InputProps> = ({ onChange, ...props }) => {
	const ref = useRef<TextInput>(null);

	return (
		<XStack
			borderRadius="$4"
			borderWidth={1}
			borderColor="$color.color"
			backgroundColor="$backgroundTransparent10"
			jc="center"
			ai="center"
		>
			<TamaguiInput
				ref={ref}
				size="$5"
				color="$color.white"
				placeholderTextColor="$color.primary"
				textTransform="none"
				p="$3"
				borderWidth={0}
				bg="transparent"
				f={1}
				onChange={(e) => {
					onChange?.(e);
				}}
				{...props}
			/>
			{!!props.value && (
				<Button
					circular
					transparent
					onPress={() => {
						if (ref.current) {
							console.log("Clearing input");
							ref.current.clear();

							const ev = makeTextInputChangeEvent("", ref.current);
							onChange?.(ev);
						}
					}}
				>
					<CloseIcon color="white" size={16} />
				</Button>
			)}
		</XStack>
	);
};
