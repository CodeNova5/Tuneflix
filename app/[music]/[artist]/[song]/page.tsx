"use client";
import React from "react";
import { useParams } from "next/navigation";

interface Track {
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  preview_url: string | null;
}

export default function Page() {
  const { artist, song } = useParams() as { artist: string; song: string };
  const [track, setTrack] = React.useState<Track | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (artist && song) {
      async function fetchData() {
        try {
          const response = await fetch(
            `/api/song-details?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`
          );
          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.error || "Failed to fetch song details");
            return;
          }
          const trackData = await response.json();
          setTrack(trackData);
        } catch (err) {
          console.error("Error fetching song details:", err);
          setError("An unexpected error occurred");
        }
      }
      fetchData();
    }
  }, [artist, song]);

  if (error) {
    return <h1>{error}</h1>;
  }

  if (!track) {
    return <h1>Loading...</h1>;
  }

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