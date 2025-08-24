import { useGetMergeAlbums } from "@/store/songsStore";
import { useState } from "react";

const useMergeAlbums = () => {
	const [loading, setLoading] = useState(false);
	const merge = useGetMergeAlbums();
	const mergeAlbums = async (
		targetAlbumId: string,
		otherAlbumsIds: string[]
	) => {
		setLoading(true);
		await merge(targetAlbumId, otherAlbumsIds);
		setLoading(false);
	};

	return { mergeAlbums, loading };
};

export default useMergeAlbums;
