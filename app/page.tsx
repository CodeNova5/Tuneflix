"use client";

import React, { useEffect, useState } from "react";

export default function HomePage() {
  const [featuredPlaylist, setFeaturedPlaylist] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedPlaylist() {
      try {
        // Replace with your API endpoint or logic to fetch the playlist
        const response = await fetch(`/api/Music/route?type=featuredPlaylist`);
        if (!response.ok) throw new Error("Failed to fetch featured playlist");
        const data = await response.json();
        setFeaturedPlaylist(data);
      } catch (err: any) {
        console.error(err.message);
        setError(err.message);
      }
    }

    fetchFeaturedPlaylist();
  }, []);

  if (error) {
    return <h1>Error: {error}</h1>;
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {/* Hero Section */}
      {featuredPlaylist ? (
        <section>
          <h1>🎵 {featuredPlaylist.name}</h1>
          <img
            src={featuredPlaylist.image || "/placeholder.jpg"}
            alt={featuredPlaylist.name}
            style={{ width: "100%", maxWidth: "600px", borderRadius: "8px" }}
          />
          <p>{featuredPlaylist.description}</p>
          <button
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#1DB954",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Play Now
          </button>
        </section>
      ) : (
        <p>Loading featured playlist...</p>
      )}
    </div>
  );
}