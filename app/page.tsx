"use client";

import React from "react";
import Link from "next/link";

export default function MusicHomePage() {
  const [topSongs, setTopSongs] = React.useState<any[]>([]);
  const [topArtists, setTopArtists] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchTopSongs() {
      try {
        const response = await fetch("/api/Music/route?type=topSongs");
        if (!response.ok) {
          throw new Error("Failed to fetch top songs");
        }
        const data = await response.json();
        setTopSongs(data);
      } catch (err) {
        console.error("Error fetching top songs:", err);
        setError("Failed to load top songs.");
      }
    }

    async function fetchTopArtists() {
      try {
        const response = await fetch("/api/Music/route?type=topArtists");
        if (!response.ok) {
          throw new Error("Failed to fetch top artists");
        }
        const data = await response.json();
        setTopArtists(data);
      } catch (err) {
        console.error("Error fetching top artists:", err);
        setError("Failed to load top artists.");
      }
    }

    fetchTopSongs();
    fetchTopArtists();
  }, []);

  if (error) {
    return <h1>{error}</h1>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Music Homepage</h1>

      {/* Top Songs Section */}
      <section style={{ marginBottom: "40px" }}>
        <h2>Top Songs Globally</h2>
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "20px",
            padding: "10px",
          }}
        >
          {topSongs.map((song, index) => (
            <div
              key={index}
              style={{
                minWidth: "200px",
                textAlign: "center",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              <Link
                href={`/music/${encodeURIComponent(
                  song.artist
                )}/song/${encodeURIComponent(song.name)}`}
              >
                <a style={{ textDecoration: "none", color: "inherit" }}>
                  <img
                    src={song.image || "/placeholder.jpg"}
                    alt={song.name}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                  <h3 style={{ fontSize: "16px", margin: "10px 0" }}>
                    {song.name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#555" }}>
                    {song.artist}
                  </p>
                </a>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Top Artists Section */}
      <section>
        <h2>Top Artists Globally</h2>
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "20px",
            padding: "10px",
          }}
        >
          {topArtists.map((artist, index) => (
            <div
              key={index}
              style={{
                minWidth: "200px",
                textAlign: "center",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              <Link href={`/music/${encodeURIComponent(artist.name)}`}>
                <a style={{ textDecoration: "none", color: "inherit" }}>
                  <img
                    src={artist.image || "/placeholder.jpg"}
                    alt={artist.name}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                  <h3 style={{ fontSize: "16px", margin: "10px 0" }}>
                    {artist.name}
                  </h3>
                </a>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}