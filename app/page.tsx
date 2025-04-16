"use client";

import React, { useEffect, useState } from "react";

export default function HomePage() {
  const [topSongs, setTopSongs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopSongs() {
      try {
        const response = await fetch(`/api/Music/route?type=topSongs`);
        if (!response.ok) throw new Error("Failed to fetch top songs");
        const data = await response.json();
        setTopSongs(data);
      } catch (err: any) {
        console.error(err.message);
        setError(err.message);
      }
    }

    fetchTopSongs();
  }, []);

  if (error) {
    return <h1>Error: {error}</h1>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎵 Billboard Top 20 Songs</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {topSongs.map((song, index) => (
          <div key={index} style={{ textAlign: "center", width: "200px" }}>
            <img
              src={song.image}
              alt={song.title}
              style={{ width: "100%", borderRadius: "8px" }}
            />
            <h3>{song.title}</h3>
            <p>{song.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
}