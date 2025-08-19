import { useGetToastData } from "@/store/appStore";
import { Toast } from "@tamagui/toast";
import { YStack } from "tamagui";

const ToastContent = () => {
	const currentToast = useGetToastData();

	if (!currentToast) {
		return <></>;
	}

	return (
		<Toast
			animation="200ms"
			key={currentToast.id}
			duration={currentToast.duration}
			enterStyle={{ opacity: 0, transform: [{ translateY: 100 }] }}
			exitStyle={{ opacity: 0, transform: [{ translateY: 100 }] }}
			transform={[{ translateY: 0 }]}
			opacity={1}
			scale={1}
			bg="$color.color"
		>
			<YStack>
				<Toast.Title color="$color.white" fontWeight={"200"}>{currentToast.title}</Toast.Title>
				{!!currentToast.message && (
					<Toast.Description color="$color.white" fontWeight={"400"}>
						{currentToast.message}
					</Toast.Description>
				)}
			</YStack>
		</Toast>
	);
};

export default ToastContent;
