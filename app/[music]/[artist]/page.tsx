"use client";
import React from "react";
import { useParams } from "next/navigation";

interface Track {
  name: string;
  album: {
    images: { url: string }[];
  };
  artists: { name: string }[];
}

export default function ArtistPage() {
  const { artist } = useParams() as { artist: string };
  const [artistDetails, setArtistDetails] = React.useState<any | null>(null);
  const [topTracks, setTopTracks] = React.useState<Track[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (artist) {
      async function fetchArtistData() {
        try {
          // Fetch artist details
          const artistResponse = await fetch(
            `/api/Music/route?type=artistDetails&artistName=${encodeURIComponent(artist)}`
          );
          if (!artistResponse.ok) {
            const errorData = await artistResponse.json();
            setError(errorData.error || "Failed to fetch artist details");
            return;
          }
          const artistData = await artistResponse.json();
          setArtistDetails(artistData);

          const tracksResponse = await fetch(
            `/api/Music/route?type=artistSongs&artistName=${encodeURIComponent(artist)}`
          );
          if (!tracksResponse.ok) {
            const errorData = await tracksResponse.json();
            setError(errorData.error || "Failed to fetch songs");
            return;
          }
          const tracksData = await tracksResponse.json();
          
          // Filter out duplicates
          const filteredTracks = tracksData.filter(
            (track: any, index: number, self: any[]) =>
              index === self.findIndex((t) => t.name === track.name)
          );
          
          if (!tracksResponse.ok) {
            const errorData = await tracksResponse.json();
            setError(errorData.error || "Failed to fetch top tracks");
            return;
          }
          setTopTracks(filteredTracks);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("An unexpected error occurred");
        }
      }

      fetchArtistData();
    }
  }, [artist]);

  if (error) {
    return <h1>{error}</h1>;
  }

  if (!artistDetails) {
    return <h1>Loading...</h1>;
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>{artistDetails.name}</h1>
      <img
        src={artistDetails.image || "/placeholder.jpg"}
        alt={artistDetails.name}
        style={{ borderRadius: "50%", width: "200px", height: "200px" }}
      />
      <h2>Top Tracks</h2>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "20px",
          padding: "10px",
        }}
      >
        {topTracks.map((track, index) => (
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
            <img
              src={track.album.images[0]?.url || "/placeholder.jpg"}
              alt={track.name}
              style={{ width: "100%", borderRadius: "8px" }}
            />
            <h3 style={{ fontSize: "16px", margin: "10px 0" }}>{track.name}</h3>
            <p style={{ fontSize: "14px", color: "#555" }}>
              {track.artists.map((a) => a.name).join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}