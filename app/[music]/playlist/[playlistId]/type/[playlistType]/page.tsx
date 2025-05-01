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

interface PlaylistDetails {
  name: string;
  image: string;
}

export default function HomePage() {
  const { playlistId } = useParams() as { playlistId: string };
  const { playlistType } = useParams() as { playlistType: string };
  const [error, setError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<tracks[]>([]);
  const [playlistDetails, setPlaylistDetails] = useState<PlaylistDetails | null>(null);

  useEffect(() => {
    async function fetchPlaylistData() {
      try {
        const response = await fetch(
          `/api/Music/route?type=playlist&playlistId=${playlistId}&playlistType=${playlistType}`
        );
        if (!response.ok) throw new Error("Failed to fetch playlist data");
        const data = await response.json();

        // Extract playlist details and tracks from the response
        if (playlistType === "deezer") {
          setPlaylistDetails({
            name: data.title, // Adjust based on Deezer API response structure
            image: data.picture_medium, // Adjust based on Deezer API response structure
          });
          setTracks(data.tracks.data); // Adjust based on Deezer API response structure
        } else if (playlistType === "spotify") {
          setPlaylistDetails({
            name: data.name, // Adjust based on Spotify API response structure
            image: data.images[0]?.url || "/placeholder.jpg", // Adjust based on Spotify API response structure
          });
          setTracks(
            data.tracks.items.map((item: any) => ({
              id: item.track.id,
              title: item.track.name,
              artist: { name: item.track.artists[0]?.name || "Unknown Artist" },
              album: { cover_medium: item.track.album.images[0]?.url || "/placeholder.jpg" },
            }))
          ); // Normalize Spotify API response
        }
      } catch (err: any) {
        console.error(err.message);
        setError(err.message);
      }
    }

    if (playlistId && playlistType) {
      fetchPlaylistData();
    } else {
      setError("Missing playlist ID or type");
    }
  }, [playlistId, playlistType]);

  if (error) {
    return <h1>Error: {error}</h1>;
  }

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      {playlistDetails && (
        <div className="mb-8 text-center">
          <img
            src={playlistDetails.image}
            alt={playlistDetails.name}
            className="w-32 h-32 mx-auto rounded-full object-cover"
          />
          <h1 className="text-3xl font-bold mt-4">{playlistDetails.name}</h1>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Tracks</h2>
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
