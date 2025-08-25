import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import Cover from "@/components/partials/Cover";
import SheetDialog from "@/components/partials/SheetDialog";
import { H1, H2 } from "@/components/ui/Headings";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import { Text } from "@/components/ui/Text";
import useMergeArtists from "@/hooks/useMergeArtists";
import { Artist } from "@/models";
import { useGetSetToastData } from "@/store/appStore";
import {
	useGetArtistById,
	useGetDeleteArtist,
	useGetSimilarArtists,
	useGetUpdateArtist,
	useRefreshArtists,
} from "@/store/songsStore";
import { tamaguiConfig } from "@/tamagui.config";
import { isValidUrl } from "@/utils/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	Button,
	Form,
	ScrollView,
	Separator,
	Spinner,
	View,
	XStack,
	YStack,
} from "tamagui";
import { z } from "zod";

type EditFormProps = {
	artist: Artist;
};

const artistSchema = z.object({
	name: z
		.string()
		.min(2, t`The name must have at least 2 characters`)
		.max(250, t`Too long`),
	artworkUri: isValidUrl,
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
							placeholder={t`Artist name`}
							returnKeyType="next"
						/>
					)}
				/>
				{!!errors.name && <Text color="$red10">{errors.name.message}</Text>}
			</YStack>

			<YStack gap="$2" paddingBottom="$4">
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
	const [similarArtists, setSimilarArtists] = useState<Artist[]>([]);
	const getSimilarArtists = useGetSimilarArtists();
	const { loading: mergeLoading, mergeArtists } = useMergeArtists();
	const refreshArtists = useRefreshArtists();
	const [open, setOpen] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const setToastData = useGetSetToastData();
	const deleteArtist = useGetDeleteArtist();

	useEffect(() => {
		if (id) {
			getArtistById(id).then((fetchedArtist) => {
				setArtist(fetchedArtist);
				setLoading(false);
			});
		}
	});

	const fetchSimilarArtists = useCallback(async () => {
		if (artist) {
			getSimilarArtists(artist).then(setSimilarArtists);
		}
	}, [artist, getSimilarArtists]);

	useEffect(() => {
		if (artist) {
			fetchSimilarArtists();
		}
	}, [artist, fetchSimilarArtists]);

	const handleMerging = () => {
		if (artist && similarArtists.length > 0) {
			const otherArtistsIds = similarArtists.map((a) => a.id);
			mergeArtists(artist.id, otherArtistsIds).then(() => {
				setOpen(false);
				setToastData({
					id: "merge_artists",
					title: t`Artists merged`,
					message: t`The artists have been merged successfully`,
					duration: 3000,
				});
				refreshArtists(100_000);
				fetchSimilarArtists();
			});
		}
	};

	const handleDelete = () => {
		if (artist) {
			deleteArtist(artist.id).then(() => {
				setToastData({
					id: "artist_deleted",
					title: t`Artist deleted`,
					message: t`The artist has been deleted correctly`,
				});
				router.push("/artists");
			});
		}
	};

	if (loading) {
		return <Loading />;
	}

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
						<Trans>Edit artist</Trans>
					</H1>
					<View w={42} />
				</XStack>
				<ScrollView>
					<YStack gap="$4">
						<YStack paddingHorizontal="$4">
							{!artist && <Loading />}
							{artist && <EditForm artist={artist} />}
							{artist && (
								<>
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
									<Button
										bg="transparent"
										onPress={() => setOpenDelete(true)}
										marginTop="$4"
									>
										<XStack ai="center" gap="$2">
											<TrashIcon
												color={tamaguiConfig.tokens.color.red9Light.val}
												size={16}
											/>
											<Text color="$red9Light">
												<Trans>Delete artist</Trans>
											</Text>
										</XStack>
									</Button>
								</>
							)}
						</YStack>
						{!!similarArtists.length && (
							<YStack p="$4" gap="$4">
								<Separator borderColor={"$backgroundTransparent10"} />
								<H2>
									<Trans>Same artist?</Trans>
								</H2>
								<Text>
									<Trans>
										These artists share the same name because Android reads it
										from the ID3 tags, which you can edit in Lissn.
									</Trans>
								</Text>
								<YStack gap="$3">
									{similarArtists.map((similarArtist) => (
										<XStack key={similarArtist.id} gap="$4" ai="center">
											<Cover
												coverPath={similarArtist.artworkUri || ""}
												size={36}
											/>
											<Text
												textAlign="center"
												fontWeight="$1"
												fontSize="$6"
												color="$color.tertiary"
											>
												{similarArtist.name}
											</Text>
										</XStack>
									))}
								</YStack>

								<Button
									chromeless
									onPress={() => setOpen(true)}
									icon={mergeLoading ? Spinner : undefined}
									bg="$backgroundDarkTransparent20"
								>
									<Text color="$color.primary">
										{!mergeLoading && <Trans>Merge them</Trans>}
										{mergeLoading && <Trans>Merging...</Trans>}
									</Text>
								</Button>
							</YStack>
						)}
					</YStack>
				</ScrollView>

				<SheetDialog open={open} onOpenChange={(val: boolean) => setOpen(val)}>
					<YStack gap="$3" p="$4">
						<H2>
							<Trans>Merge artists</Trans>
						</H2>
					</YStack>
					<Text>Are you sure you want to merge these artists?</Text>
					<XStack gap="$4" jc="flex-start" mt="$4">
						<Button
							bg="$color.color"
							onPress={() => handleMerging()}
							marginTop="$4"
							color="$color.white"
						>
							<Text>
								<Trans>Merge</Trans>
							</Text>
						</Button>
						<Button
							bg="$color.backgroundDarkTransparent20"
							onPress={() => setOpen(false)}
							marginTop="$4"
							color="$color.white"
						>
							<Text>
								<Trans>Cancel</Trans>
							</Text>
						</Button>
					</XStack>
				</SheetDialog>

				<SheetDialog
					open={openDelete}
					onOpenChange={(val: boolean) => setOpenDelete(val)}
				>
					<YStack gap="$3" p="$4">
						<H2>
							<Trans>Delete artist</Trans>
						</H2>
					</YStack>
					<Text>Are you sure you want to delete this artist?</Text>
					<XStack gap="$4" jc="flex-start" mt="$4">
						<Button
							bg="$red9Light"
							onPress={() => handleDelete()}
							marginTop="$4"
							color="$color.white"
						>
							<Text>
								<Trans>Delete</Trans>
							</Text>
						</Button>
						<Button
							bg="$color.backgroundDarkTransparent20"
							onPress={() => setOpenDelete(false)}
							marginTop="$4"
							color="$color.white"
						>
							<Text>
								<Trans>Cancel</Trans>
							</Text>
						</Button>
					</XStack>
				</SheetDialog>
			</YStack>
		</>
	);
}
