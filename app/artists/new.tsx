import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import { H1 } from "@/components/ui/Headings";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import { Artist } from "@/models";
import { useGetSetToastData } from "@/store/appStore";
import {
	useGetCreateArtist
} from "@/store/songsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
	Button,
	Form,
	ScrollView,
	View,
	XStack,
	YStack
} from "tamagui";
import { z } from "zod";

const artistSchema = z.object({
	name: z
		.string()
		.min(2, t`The name must have at least 2 characters`)
		.max(250, t`Too long`),
	artworkUri: z
		.string()
		.max(120, t`Too long`)
		.regex(
			/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/,
			t`Not valid URL`
		)
		.optional()
		.or(z.literal("")),
});

const CreateForm: React.FC = () => {
	const { t } = useLingui();
	const create = useGetCreateArtist();
	const router = useRouter();
	const setToastData = useGetSetToastData();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<z.infer<typeof artistSchema>>({
		resolver: zodResolver(artistSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			artworkUri: "",
		},
	});

	const onSubmit = (data: Partial<Artist>) => {
		create(data).then(() => {
				setToastData({
					id: "artist-created",
					title: t`New artist`,
					message: t`Artist created successfully`,
				});
			router.back();
		});
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
							placeholder={t`Nombre del artista`}
							returnKeyType="next"
						/>
					)}
				/>
				{!!errors.name && <Text color="$red10">{errors.name.message}</Text>}
			</YStack>

			<YStack gap="$2">
				<Label htmlFor="externalId">
					<Trans>Artwork URL</Trans>
				</Label>
				<Controller
					control={control}
					name="artworkUri"
					render={({ field: { value, onChange, onBlur } }) => (
						<Input
							id="externalId"
							value={value}
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder="https://..."
							autoCapitalize="none"
							autoCorrect={false}
							returnKeyType="done"
						/>
					)}
				/>
				{!!errors.artworkUri && (
					<Text color="$red10">{errors.artworkUri.message}</Text>
				)}
			</YStack>

			<Form.Trigger asChild>
				<Button disabled={!isValid || isSubmitting} bg="$color.color">
					<Text>{isSubmitting ? t`Saving...` : t`Save`}</Text>
				</Button>
			</Form.Trigger>
		</Form>
	);
};

export default function NewArtistScreen() {
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
						<Trans>New artist</Trans>
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
