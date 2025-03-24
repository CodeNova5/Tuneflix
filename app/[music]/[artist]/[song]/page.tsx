"use client";
import React from "react";
import { useRouter } from "next/router";

interface Track {
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  preview_url: string | null;
}

export default function Page() {
  const router = useRouter();
  const { artist, song } = router.query as { artist: string; song: string };
  const [track, setTrack] = React.useState<Track | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (isClient && router.isReady && artist && song) {
      async function fetchData() {
        const response = await fetch(`/api/song-details?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`);
        const trackData = await response.json();
        setTrack(trackData);
      }
      fetchData();
    }
  }, [isClient, router.isReady, artist, song]);

  if (!track) return <h1>Song not found</h1>;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>{track.name}</h1>
      <h2>by {track.artists.map((a) => a.name).join(", ")}</h2>
      <p>Album: {track.album.name}</p>
      <img src={track.album.images[0]?.url} alt={track.name} width="300" />
      {track.preview_url && (
        <audio controls>
          <source src={track.preview_url} type="audio/mpeg" />
          Your browser does not support the audio tag.
        </audio>
      )}
    </div>
  );
}