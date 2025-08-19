import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import { H1 } from "@/components/ui/Headings";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import { Text } from "@/components/ui/Text";
import { Artist } from "@/models";
import { useGetArtistById, useGetUpdateArtist } from "@/store/songsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Form, View, XStack, YStack } from "tamagui";
import { z } from "zod";

type EditFormProps = {
	artist: Artist;
};

const artistSchema = z.object({
	name: z
		.string()
		.min(2, t`The name must have at least 2 characters`)
		.max(120, t`Too long`),
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

const EditForm: React.FC<EditFormProps> = ({ artist }) => {
	const { t } = useLingui();
	const update = useGetUpdateArtist();
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<z.infer<typeof artistSchema>>({
		resolver: zodResolver(artistSchema),
		mode: "onChange",
		defaultValues: {
			name: artist?.name,
			artworkUri: artist?.artworkUri,
		},
	});

	const onSubmit = (data: Partial<Artist>) => {
		update(artist.id, data).then(() => router.back());
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

export default function PlaylistsScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const getArtistById = useGetArtistById();
	const router = useRouter();
	const [artist, setArtist] = useState<Artist | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (id) {
			getArtistById(id).then((fetchedArtist) => {
				setArtist(fetchedArtist);
				setLoading(false);
			});
		}
	});

	if (loading) {
		return <Loading />;
	}

	return (
		<YStack flex={1} p="$2" gap="$4">
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
					<Trans>Edit artist</Trans>
				</H1>
				<View w={42} />
			</XStack>
			<YStack paddingHorizontal="$6">
				{!artist && <Loading />}
				{artist && <EditForm artist={artist} />}
				{artist && (
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
				)}
			</YStack>
		</YStack>
	);
}
