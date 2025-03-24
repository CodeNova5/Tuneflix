// filepath: c:\Users\HP i7\Documents\Next\my-next-app\app\[music]\[artist]\[song]\page.tsx
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
  if (typeof window === 'undefined') {
    return null; // Ensure the component only renders on the client side
  }

  const router = useRouter();
  const { artist, song } = router.query as { artist: string; song: string };
  const [track, setTrack] = React.useState<Track | null>(null);

  React.useEffect(() => {
    if (router.isReady && artist && song) {
      async function fetchData() {
        const response = await fetch(`/api/song-details?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`);
        const trackData = await response.json();
        setTrack(trackData);
      }
      fetchData();
    }
  }, [router.isReady, artist, song]);

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