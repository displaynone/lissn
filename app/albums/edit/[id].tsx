import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import Cover from "@/components/partials/Cover";
import SheetDialog from "@/components/partials/SheetDialog";
import { H1, H2 } from "@/components/ui/Headings";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import { Text } from "@/components/ui/Text";
import useMergeAlbums from "@/hooks/useMergeAlbums";
import { Album } from "@/models";
import { useGetSetToastData } from "@/store/appStore";
import {
	useGetAlbumById,
	useGetSimilarAlbums,
	useGetUpdateAlbum,
	useRefreshAlbums,
} from "@/store/songsStore";
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
	album: Album;
};

const albumSchema = z.object({
	title: z
		.string()
		.min(2, t`The title must have at least 2 characters`)
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

const EditForm: React.FC<EditFormProps> = ({ album }) => {
	const { t } = useLingui();
	const update = useGetUpdateAlbum();
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<z.infer<typeof albumSchema>>({
		resolver: zodResolver(albumSchema),
		mode: "onChange",
		defaultValues: {
			title: album?.title,
			artworkUri: album?.artworkUri,
		},
	});

	const onSubmit = (data: Partial<Album>) => {
		update(album.id, data).then(() => router.back());
	};

	return (
		<Form onSubmit={handleSubmit(onSubmit)} gap="$4">
			<YStack gap="$2">
				<Label htmlFor="title">
					<Trans>Name</Trans>
				</Label>
				<Controller
					control={control}
					name="title"
					render={({ field: { value, onChange, onBlur } }) => (
						<Input
							id="title"
							value={value}
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder={t`Album name`}
							returnKeyType="next"
						/>
					)}
				/>
				{!!errors.title && <Text color="$red10">{errors.title.message}</Text>}
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
	const getAlbumById = useGetAlbumById();
	const router = useRouter();
	const [album, setAlbum] = useState<Album | null>(null);
	const [loading, setLoading] = useState(true);
	const [similarAlbums, setSimilarAlbums] = useState<Album[]>([]);
	const getSimilarAlbums = useGetSimilarAlbums();
	const { loading: mergeLoading, mergeAlbums } = useMergeAlbums();
	const refreshAlbums = useRefreshAlbums();
	const [open, setOpen] = useState(false);
	const setToastData = useGetSetToastData();

	useEffect(() => {
		if (id) {
			getAlbumById(id).then((fetchedAlbum) => {
				setAlbum(fetchedAlbum);
				setLoading(false);
			});
		}
	});

	const fetchSimilarAlbums = useCallback(async () => {
		if (album) {
			getSimilarAlbums(album).then(setSimilarAlbums);
		}
	}, [album, getSimilarAlbums]);

	useEffect(() => {
		if (album) {
			fetchSimilarAlbums();
		}
	}, [album, fetchSimilarAlbums]);

	const handleMerging = () => {
		if (album && similarAlbums.length > 0) {
			const otherAlbumsIds = similarAlbums.map((a) => a.id);
			mergeAlbums(album.id, otherAlbumsIds).then(() => {
				setOpen(false);
				setToastData({
					id: "merge_albums",
					title: t`Albums merged`,
					message: t`The albums have been merged successfully`,
					duration: 3000,
				});
				refreshAlbums(100_000);
				fetchSimilarAlbums();
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
						<Trans>Edit album</Trans>
					</H1>
					<View w={42} />
				</XStack>
				<ScrollView>
					<YStack gap="$4">
						<YStack paddingHorizontal="$4">
							{!album && <Loading />}
							{album && <EditForm album={album} />}
							{album && (
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
						{!!similarAlbums.length && (
							<YStack p="$4" gap="$4">
								<Separator borderColor={"$backgroundTransparent10"}/>
								<H2>
									<Trans>Same album?</Trans>
								</H2>
								<Text>
									<Trans>
										These albums share the same title because Android reads it
										from the ID3 tags, which you can edit in Lissn.
									</Trans>
								</Text>
								<YStack gap="$3">
									{similarAlbums.map((similarAlbum) => (
										<XStack key={similarAlbum.id} gap="$4" ai="center">
											<Cover
												coverPath={similarAlbum.artworkUri || ""}
												size={36}
											/>
											<Text
												textAlign="center"
												fontWeight="$1"
												fontSize="$6"
												color="$color.tertiary"
											>
												{similarAlbum.title}
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
							<Trans>Merge albums</Trans>
						</H2>
					</YStack>
					<Text>Are you sure you want to merge these albums?</Text>
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
			</YStack>
		</>
	);
}
