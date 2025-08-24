import { Trans, useLingui } from "@lingui/react/macro";
import { LinearGradient } from "@tamagui/linear-gradient";
import { ReactNode, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Adapt,
  Sheet,
  Select as TamaguiSelect,
  SelectProps as TamaguiSelectProps,
  YStack,
} from "tamagui";
import CheckIcon from "../icons/CheckIcon";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import ChevronUpIcon from "../icons/ChevronUpIcon";
import { H2 } from "./Headings";
import { Text } from "./Text";

type SelectProps<T> = TamaguiSelectProps & { trigger?: React.ReactNode } & {
	items: T[];
	placeholder?: string;
	getId: (item: T) => string;
	getDescription: (item: T) => string | ReactNode;
};

const Select = <T,>({
	value,
	items,
	placeholder,
	onValueChange,
	getId,
	getDescription,
	...props
}: SelectProps<T>) => {
	const { t } = useLingui();
	const insets = useSafeAreaInsets();

	return (
		<TamaguiSelect
			value={value}
			onValueChange={onValueChange}
			disablePreventBodyScroll
			{...props}
		>
			{props?.trigger || (
				<TamaguiSelect.Trigger
					borderRadius="$4"
					p="$3"
					borderWidth={1}
					borderColor="$color.color"
					backgroundColor="$backgroundTransparent10"
					iconAfter={() => <ChevronDownIcon color="white" />}
				>
					<TamaguiSelect.Value
						placeholder={placeholder || t`Select an option`}
					/>
				</TamaguiSelect.Trigger>
			)}

			<Adapt platform="touch">
				<Sheet
					modal
					snapPointsMode={"fit"}
					dismissOnSnapToBottom
					animation="medium"
				>
					<Sheet.Frame>
						<Sheet.ScrollView>
							<Adapt.Contents />
						</Sheet.ScrollView>
					</Sheet.Frame>
					<Sheet.Overlay
						backgroundColor="$shadowColor"
						animation="lazy"
						enterStyle={{ opacity: 0 }}
						exitStyle={{ opacity: 0 }}
					/>
				</Sheet>
			</Adapt>

			<TamaguiSelect.Content zIndex={200_000}>
				<TamaguiSelect.ScrollUpButton
					alignItems="center"
					justifyContent="center"
					position="relative"
					width="100%"
					height="$3"
					maxHeight={200}
				>
					<YStack zIndex={10}>
						<ChevronUpIcon size={20} color="white" />
					</YStack>
					<LinearGradient
						start={[0, 0]}
						end={[0, 1]}
						fullscreen
						colors={["$background", "transparent"]}
						borderRadius="$4"
					/>
				</TamaguiSelect.ScrollUpButton>

				<TamaguiSelect.Viewport minWidth={200}>
					<TamaguiSelect.Group>
						<TamaguiSelect.Label>
							<H2 paddingTop={insets.top}>
								<Trans>Select an option</Trans>
							</H2>
						</TamaguiSelect.Label>
						{/* for longer lists memoizing these is useful */}
						{useMemo(
							() =>
								items.map((item, i) => {
									return (
										<TamaguiSelect.Item
											index={i}
											key={getId(item)}
											value={getId(item)}
										>
											<TamaguiSelect.ItemText>
												<Text>{getDescription(item)}</Text>
											</TamaguiSelect.ItemText>
											<TamaguiSelect.ItemIndicator marginLeft="auto">
												<CheckIcon size={16} color="white" />
											</TamaguiSelect.ItemIndicator>
										</TamaguiSelect.Item>
									);
								}),
							[getDescription, getId, items]
						)}
					</TamaguiSelect.Group>
				</TamaguiSelect.Viewport>

				<TamaguiSelect.ScrollDownButton
					alignItems="center"
					justifyContent="center"
					position="relative"
					width="100%"
					height="$3"
				>
					<YStack zIndex={10}>
						<ChevronDownIcon size={20} />
					</YStack>
					<LinearGradient
						start={[0, 0]}
						end={[0, 1]}
						fullscreen
						colors={["transparent", "$background"]}
						borderRadius="$4"
					/>
				</TamaguiSelect.ScrollDownButton>
			</TamaguiSelect.Content>
		</TamaguiSelect>
	);
};

export default Select;
