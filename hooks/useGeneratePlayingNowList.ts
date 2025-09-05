import { PLAYLIST_PLAYING_NOW_NAME } from "@/models/Playlist";
import { useMusicStore } from "@/store/songsStore";
import { PlaylistType } from "@/utils/types";
import { useState } from "react";

const useGeneratePlayingNowList = () => {
	const [loading, setLoading] = useState(false);
	const {
		deletePlaylistSongs,
		playlists,
		getAllSongIds,
		createPlaylistSong,
		getFavoriteSongs,
		refreshPlayingNowSongs,
	} = useMusicStore();
	const generatePlaylist = async (origin: PlaylistType) => {
		setLoading(true);
		const playlist = playlists.find(
			(pl) => pl.name === PLAYLIST_PLAYING_NOW_NAME
		);

		if (!playlist) {
			return;
		}
		await deletePlaylistSongs(playlist);
		if (origin === "latest") {
			const ids = await getAllSongIds();
			for (let i = 0; i < ids.length; i++) {
				await createPlaylistSong(playlist.id, ids[i], i);
			}
			await refreshPlayingNowSongs();
		} else if (origin === "/playlists/favorites") {
			const favorites = await getFavoriteSongs();
			for (let i = 0; i < favorites.length; i++) {
				await createPlaylistSong(playlist.id, favorites[i].id, i);
			}
			await refreshPlayingNowSongs();
		}
		setLoading(false);
	};

	return { generatePlaylist, loading };
};

export default useGeneratePlayingNowList;
