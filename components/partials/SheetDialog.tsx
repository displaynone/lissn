import { Sheet } from "tamagui";

type SheetDialogProps = {
	open: boolean;
	children: React.ReactNode;
	onOpenChange?: (open: boolean) => void;
};

const SheetDialog: React.FC<SheetDialogProps> = ({
	open,
	onOpenChange = () => {},
	children,
}) => {
	return (
		<Sheet
			forceRemoveScrollEnabled={open}
			modal={true}
			open={open}
			onOpenChange={onOpenChange}
			snapPointsMode={"fit"}
			dismissOnSnapToBottom
			zIndex={100_000}
			animation="medium"
		>
			<Sheet.Overlay
				animation="lazy"
				enterStyle={{ opacity: 0 }}
				exitStyle={{ opacity: 0 }}
				bg="$color.backgroundDarkTransparent40"
			/>

			<Sheet.Frame
				padding="$4"
				justifyContent="center"
				alignItems="center"
				alignSelf="center"
				w="90%"
			>
				{children}
			</Sheet.Frame>
		</Sheet>
	);
};

export default SheetDialog;
