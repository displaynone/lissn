import { useGetMergeArtists } from "@/store/songsStore";
import { useState } from "react";

const useMergeArtists = () => {
	const [loading, setLoading] = useState(false);
	const merge = useGetMergeArtists();
	const mergeArtists = async (
		targetArtistId: string,
		otherArtistsIds: string[]
	) => {
		setLoading(true);
		await merge(targetArtistId, otherArtistsIds);
		setLoading(false);
	};

	return { mergeArtists, loading };
};

export default useMergeArtists;
