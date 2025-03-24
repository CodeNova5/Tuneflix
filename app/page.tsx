"use client";

import { useEffect, useState } from "react";

export default function Home() {
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        fetch("/api/spotify")
            .then(res => res.json())
            .then(data => setAlbums(data.albums.items));
    }, []);

    return (
        <div>
            <h1>New Releases</h1>
            {albums.map(album => (
                <div key={album.id}>
                    <a href={`/artist/${album.artists[0].id}`}>{album.artists[0].name}</a>
                </div>
            ))}
        </div>
    );
}