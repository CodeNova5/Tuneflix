"use client";

import React, { useEffect, useState } from "react";

export default function HomePage() {
  interface Artist {
    name: string;
  }

  interface Album {
    id: string;
    name: string;
    images: { url: string }[];
    artists: Artist[];
  }

  const [newReleases, setNewReleases] = useState<Album[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNewReleases() {
      try {
        const response = await fetch(`/api/Music/route?type=newReleases`);
        if (!response.ok) throw new Error("Failed to fetch new releases");
        const data = await response.json();
        setNewReleases(data.albums.items);
      } catch (err: any) {
        console.error(err.message);
        setError(err.message);
      }
    }

    async function fetchFeaturedPlaylists() {
      try {
        const response = await fetch(`/api/Music/route?type=featuredPlaylists`);
        if (!response.ok) throw new Error("Failed to fetch featured playlists");
        const data = await response.json();
        setFeaturedPlaylists(data.playlists.items);
      } catch (err: any) {
        console.error(err.message);
        setError(err.message);
      }
    }

    fetchNewReleases();
    fetchFeaturedPlaylists();
  }, []);

  if (error) {
    return <h1>Error: {error}</h1>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome to My Music App</h1>

      {/* New Releases Section */}
      <section>
        <h2>🎵 New Releases</h2>
        <div style={{ display: "flex", gap: "20px", overflowX: "scroll" }}>
          {newReleases.map((album) => (
            <div key={album.id} style={{ textAlign: "center", minWidth: "200px" }}>
              <img
                src={album.images[0]?.url || "/placeholder.jpg"}
                alt={album.name}
                style={{ width: "100%", borderRadius: "8px" }}
              />
              <h3>{album.name}</h3>
              <p>{album.artists.map((artist) => artist.name).join(", ")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Playlists Section */}
      <section style={{ marginTop: "40px" }}>
        <h2>🔥 Featured Playlists</h2>
        <div style={{ display: "flex", gap: "20px", overflowX: "scroll" }}>
          {featuredPlaylists.map((playlist) => (
            <div key={playlist.id} style={{ textAlign: "center", minWidth: "200px" }}>
              <img
                src={playlist.images[0]?.url || "/placeholder.jpg"}
                alt={playlist.name}
                style={{ width: "100%", borderRadius: "8px" }}
              />
              <h3>{playlist.name}</h3>
              <p>{playlist.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}