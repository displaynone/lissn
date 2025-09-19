import { useEffect, useState } from "react";
import { Keyboard, KeyboardEvent } from "react-native";

const useKeyboardVisible = () => {
	const [visible, setVisible] = useState(false);
	const [keyboardHeight, setKeyboardHeight] = useState(0);

	useEffect(() => {
		const showSub = Keyboard.addListener(
			"keyboardDidShow",
			(e: KeyboardEvent) => {
				setVisible(true);
				setKeyboardHeight(e.endCoordinates?.height ?? 0);
			}
		);
		const hideSub = Keyboard.addListener(
			"keyboardDidHide",
			(e: KeyboardEvent) => {
				setVisible(false);
				setKeyboardHeight(0);
			}
		);

		return () => {
			showSub.remove();
			hideSub.remove();
		};
	}, []);

	return {visible, keyboardHeight};
};

export default useKeyboardVisible;
