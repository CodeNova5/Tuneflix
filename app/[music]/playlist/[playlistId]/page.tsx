"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link"; // Import Link from next/link
import { useParams } from "next/navigation";    
interface PopTrack {
  id: number;
  title: string;
  artist: { name: string };
  album: { cover_medium: string };
}

export default function HomePage() {
  const { playlistId} = useParams() as { playlistId: string; }; // Get the ID from the URL parameters
  const [error, setError] = useState<string | null>(null);
  const [popTracks, setPopTracks] = useState<PopTrack[]>([]);

  useEffect(() => {
    async function fetchPopTracks() {
        try {
            const response = await fetch(`/api/Music/route?type=playlist&playlistId=${playlistId}`);
            if (!response.ok) throw new Error("Failed to fetch pop tracks");
            const data = await response.json();
            setPopTracks(data.tracks.data); // Ensure this matches the API response structure
            console.log(data.tracks.data); // Log the data to check its structure
          } catch (err: any) {
            console.error(err.message);
            setError(err.message);
        }
    }

    fetchPopTracks();
}, []);


  if (error) {
    return <h1>Error: {error}</h1>;
  }

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Pop Tracks</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {popTracks.map((track) => (
          <Link
            key={track.id}
            href={`/music/${encodeURIComponent(track.artist.name)}/song/${encodeURIComponent(track.title)}`}
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
