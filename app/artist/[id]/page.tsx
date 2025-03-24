'use client';
import { useEffect, useState } from "react";

export default function ArtistPage({ params }: { params: { id: string } }) {
    const [artist, setArtist] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/spotify/artist/${params.id}`)
            .then(res => res.json())
            .then(data => setArtist(data));
    }, [params.id]);

    if (!artist) return <p>Loading...</p>;

    return (
        <div>
            <h1>{artist.name}</h1>
            <p>Followers: {artist.followers.total}</p>
            <img src={artist.images?.[0]?.url} alt={artist.name} width={200} />
        </div>
    );
}