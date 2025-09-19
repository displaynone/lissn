import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import { H1 } from "@/components/ui/Headings";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import { Playlist } from "@/models";
import { useGetCreatePlaylist } from "@/store/songsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { router, useRouter } from "expo-router";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Form, ScrollView, View, XStack, YStack } from "tamagui";
import { z } from "zod";

const playListSchema = z.object({
	name: z
		.string()
		.regex(/^[a-z_]+$/i, t`Not valid slug`)
		.min(2, t`The name must have at least 2 characters`)
		.max(250, t`Too long`),
});

const CreateForm: FC = () => {
	const createPlaylist = useGetCreatePlaylist();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<z.infer<typeof playListSchema>>({
		resolver: zodResolver(playListSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
		},
	});

	const onSubmit = async (data: Partial<Playlist>) => {
		await createPlaylist(data);
		router.back();
	};

	return (
		<Form onSubmit={handleSubmit(onSubmit)} gap="$4">
			<YStack gap="$2">
				<Label htmlFor="name">
					<Trans>Name</Trans>
				</Label>
				<Controller
					control={control}
					name="name"
					render={({ field: { value, onChange, onBlur } }) => (
						<Input
							id="name"
							value={value}
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder={t`Use only letters or underscore`}
							returnKeyType="next"
						/>
					)}
				/>
				{!!errors.name && <Text color="$red10">{errors.name.message}</Text>}
			</YStack>

			<Form.Trigger asChild>
				<Button disabled={!isValid || isSubmitting} bg="$color.color">
					<Text>{isSubmitting ? t`Saving...` : t`Save`}</Text>
				</Button>
			</Form.Trigger>
		</Form>
	);
};

export default function NewPlaylistScreen() {
	const router = useRouter();

	return (
		<>
			<YStack flex={1} p="$4" gap="$4">
				<XStack
					gap={"$6"}
					ai="center"
					m={"$2"}
					marginBottom={0}
					jc="space-between"
				>
					<Button
						circular
						backgroundColor={"transparent"}
						onPress={() => router.back()}
					>
						<ArrowLeftIcon color="white" />
					</Button>
					<H1>
						<Trans>New playlist</Trans>
					</H1>
					<View w={42} />
				</XStack>
				<ScrollView>
					<YStack gap="$4">
						<YStack paddingHorizontal="$4">
							<CreateForm />

							<Button
								bg="$color.backgroundDarkTransparent20"
								onPress={() => router.back()}
								marginTop="$4"
								color="$color.white"
							>
								<Text>
									<Trans>Cancel</Trans>
								</Text>
							</Button>
						</YStack>
					</YStack>
				</ScrollView>
			</YStack>
		</>
	);
}
