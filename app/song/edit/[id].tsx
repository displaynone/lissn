import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import { H1 } from "@/components/ui/Headings";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loading } from "@/components/ui/Loading";
import Select from "@/components/ui/Select";
import { Text } from "@/components/ui/Text";
import { Song } from "@/models";
import { useGetSetToastData } from "@/store/appStore";
import {
	useGetAlbums,
	useGetArtists,
	useGetSongById,
	useGetUpdateSong,
	useRefreshSongs,
} from "@/store/songsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Form, ScrollView, View, XStack, YStack } from "tamagui";
import { z } from "zod";

type EditFormProps = {
	song: Song;
};

const songSchema = z.object({
	title: z
		.string()
		.min(2, t`The title must have at least 2 characters`)
		.max(250, t`Too long`),
	coverPath: z
		.string()
		.max(250, t`Too long`)
		.regex(
			/^((https?|content):\/\/)?([a-zA-Z0-9-]+\.)*[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/,
			t`Not valid URL`
		)
		.optional()
		.or(z.literal("")),
	artistId: z.string(),
	albumId: z.string(),
});

const EditForm: React.FC<EditFormProps> = ({ song }) => {
	const { t } = useLingui();
	const update = useGetUpdateSong();
	const router = useRouter();
	const setToastData = useGetSetToastData();
	const artists = useGetArtists();
	const albums = useGetAlbums();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<z.infer<typeof songSchema>>({
		resolver: zodResolver(songSchema),
		mode: "onChange",
		defaultValues: {
			title: song?.title,
			coverPath: song?.coverPath,
			artistId: song?.artistId || "",
			albumId: song?.albumId || "",
		},
	});

	const onSubmit = (data: Partial<Song>) => {
		update(song.id, data).then(() => router.back());
		setToastData({
			id: "song_updated",
			title: t`Song update`,
			message: t`The song has been updated correctly`,
		});
		router.back();
	};

	return (
		<Form onSubmit={handleSubmit(onSubmit)} gap="$4">
			<YStack gap="$2">
				<Label htmlFor="title">
					<Trans>Title</Trans>
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
							placeholder={t`Song name`}
							returnKeyType="next"
						/>
					)}
				/>
				{!!errors.title && <Text color="$red10">{errors.title.message}</Text>}
			</YStack>

			<YStack gap="$2">
				<Label htmlFor="coverPath">
					<Trans>Artwork URL</Trans>
				</Label>
				<Controller
					control={control}
					name="coverPath"
					render={({ field: { value, onChange, onBlur } }) => (
						<Input
							id="coverPath"
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
				{!!errors.coverPath && (
					<Text color="$red10">{errors.coverPath.message}</Text>
				)}
			</YStack>

			<YStack gap="$2">
				<Label htmlFor="artistId">
					<Trans>Artist</Trans>
				</Label>
				<Controller
					control={control}
					name="artistId"
					render={({ field: { value, onChange } }) => (
						<Select
							id="artistId"
							items={artists}
							value={value}
							onValueChange={(val) => {
								onChange(val);
							}}
							getId={(item) => item.id}
							getDescription={(item) => item.name}
						/>
					)}
				/>
				{!!errors.artistId && (
					<Text color="$red10">{errors.artistId?.message}</Text>
				)}
				<Text
					color="$color.primary"
					onPress={() => router.push("/artists/new")}
				>
					<Trans>Create new artist</Trans>
				</Text>
			</YStack>

			<YStack gap="$2">
				<Label htmlFor="albumId">
					<Trans>Album</Trans>
				</Label>
				<Controller
					control={control}
					name="albumId"
					render={({ field: { value, onChange } }) => (
						<Select
							id="albumId"
							items={albums}
							value={value}
							onValueChange={(val) => {
								onChange(val);
							}}
							getId={(item) => item.id}
							getDescription={(item) => item.title}
						/>
					)}
				/>
				{!!errors.albumId && (
					<Text color="$red10">{errors.albumId.message}</Text>
				)}
				<Text
					color="$color.primary"
					onPress={() => router.push("/albums/new")}
				>
					<Trans>Create new album</Trans>
				</Text>
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
	const getSongById = useGetSongById();
	const router = useRouter();
	const [song, setSong] = useState<Song>();
	const [loading, setLoading] = useState(true);

	const refreshSongs = useRefreshSongs();

	useEffect(() => {
		setLoading(true);
		getSongById(id).then((s) => {
			if (s) {
				setSong(s);
			}
			setLoading(false);
		});
	}, [getSongById, id, refreshSongs]);

	if (loading) {
		return <Loading />;
	}

	if (!song) {
		return <></>;
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
						<Trans>Edit song</Trans>
					</H1>
					<View w={42} />
				</XStack>
				<ScrollView>
					<YStack gap="$4">
						<YStack paddingHorizontal="$4">
							{!song && <Loading />}
							{song && <EditForm song={song} />}
							{song && (
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
				</ScrollView>
			</YStack>
		</>
	);
}
