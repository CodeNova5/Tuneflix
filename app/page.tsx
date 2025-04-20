"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link"; // Import Link from next/link

interface ChartItem {
  title: string;
  artist: string;
  image: string;
}
interface PopTrack {
  id: number;
  title: string;
  artist: string;
  album: { cover_medium: string };
}

export default function HomePage() {
  const [songs, setSongs] = useState<ChartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [popTracks, setPopTracks] = useState<PopTrack[]>([]);

  useEffect(() => {
    async function fetchTopSongs() {
      try {
        const response = await fetch(`/api/Music/route?type=topSongs`);
        if (!response.ok) throw new Error("Failed to fetch top songs");
        const data = await response.json();
        setSongs(data);
      } catch (err: any) {
        console.error(err.message);
        setError(err.message);
      }
    }

    fetchTopSongs();
  }, []);
  const getFirstArtist = (artist: string): string => {
    return artist.split(/[,&]|feat(?:uring)?|\sX\s|\svs\.?\s/i)[0].trim();
  };

  useEffect(() => {
    async function fetchPopTracks() {
      try {
        const response = await fetch(`/api/Music/route?type=popSongs`);
        if (!response.ok) throw new Error("Failed to fetch pop tracks");
        const data = await response.json();
        setPopTracks(data); // Adjust based on the API response structure
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
      <h1 className="text-3xl font-bold mb-4">Billboard Global 200</h1>
      <div className="overflow-x-auto">
        <div className="grid grid-flow-col grid-rows-4 auto-cols-max gap-4 w-max">
          {songs.map((song, idx) => (
            <Link
              key={idx}
              href={`/music/${getFirstArtist(song.artist)}/song/${song.title}`}
            >
              <div className="border rounded-lg p-2 shadow-md bg-gray-800 cursor-pointer w-64">
                <img
                  src={song.image}
                  alt={song.title}
                  className="w-full h-48 object-cover rounded"
                />
                <h2 className="font-semibold mt-2">{song.title}</h2>
                <p className="text-gray-400">{song.artist}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-4">Pop Tracks</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {popTracks.map((track) => (
          <Link
            key={track.id}
            href={`/music/${encodeURIComponent(track.artist)}/song/${encodeURIComponent(track.title)}`}
          >
            <div className="border rounded-lg p-2 shadow-md bg-gray-800 cursor-pointer">
              <img
                src={track.album.cover_medium}
                alt={track.title}
                className="w-full h-48 object-cover rounded"
              />
              <h2 className="font-semibold mt-2">{track.title}</h2>
              <p className="text-gray-400">{track.artist}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>

  );
}
