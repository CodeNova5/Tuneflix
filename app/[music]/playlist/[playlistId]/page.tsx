"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface tracks {
  id: number;
  title: string;
  artist: { name: string };
  album: { cover_medium: string };
}

export default function HomePage() {
  const { playlistId } = useParams() as { playlistId: string };
  const { playlistType } = useParams() as { playlistType: string };
  const [error, setError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<tracks[]>([]);

  useEffect(() => {
    async function fetchDeezerTracks() {
      try {
        const response = await fetch(
          `/api/Music/route?type=playlist&playlistId=${playlistId}&playlistType=deezer`
        );
        if (!response.ok) throw new Error("Failed to fetch Deezer tracks");
        const data = await response.json();
        setTracks(data.tracks.data); // Adjust based on Deezer API response structure
      } catch (err: any) {
        console.error(err.message);
        setError(err.message);
      }
    }

    async function fetchSpotifyTracks() {
      try {
        const response = await fetch(
          `/api/Music/route?type=playlist&playlistId=${playlistId}&playlistType=spotify`
        );
        if (!response.ok) throw new Error("Failed to fetch Spotify tracks");
        const data = await response.json();
        setTracks(
          data.map((item: any) => ({
            id: item.track.id,
            title: item.track.name,
            artist: { name: item.track.artists[0]?.name || "Unknown Artist" },
            album: { cover_medium: item.track.album.images[0]?.url || "/placeholder.jpg" },
          }))
        ); // Normalize Spotify API response
      } catch (err: any) {
        console.error(err.message);
        setError(err.message);
      }
    }

    if (playlistType === "deezer") {
      fetchDeezerTracks();
    } else if (playlistType === "spotify") {
      fetchSpotifyTracks();
    } else {
      setError("Invalid playlist type");
    }
  }, [playlistId, playlistType]);

  if (error) {
    return <h1>Error: {error}</h1>;
  }

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Tracks</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tracks.map((track) => (
          <Link
            key={track.id}
            href={`/music/${encodeURIComponent(track.artist.name)}/song/${encodeURIComponent(
              track.title
            )}`}
          >
            <div className="border rounded-lg p-2 shadow-md bg-gray-800 cursor-pointer">
              <img
                src={track.album.cover_medium}
                alt={track.title}
                className="w-full h-48 object-cover rounded"
              />
              <h2 className="font-semibold mt-2">{track.title}</h2>
              <p className="text-gray-400">{track.artist.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
