"use client";
import React from "react";
import { useParams } from "next/navigation";

export default function AlbumPage() {
  const { artist, album } = useParams() as { artist: string; album: string };
  const [albumDetails, setAlbumDetails] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (artist && album) {
      async function fetchAlbumDetails() {
        try {
          const response = await fetch(
            `/api/Music/route?type=albumDetails&artistName=${encodeURIComponent(
              artist
            )}&albumName=${encodeURIComponent(album)}`
          );
          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.error || "Failed to fetch album details");
            return;
          }
          const data = await response.json();
          setAlbumDetails(data);
        } catch (err) {
          console.error("Error fetching album details:", err);
          setError("An unexpected error occurred");
        }
      }

      fetchAlbumDetails();
    }
  }, [artist, album]);

  if (error) {
    return <h1>{error}</h1>;
  }

  if (!albumDetails) {
    return <h1>Loading...</h1>;
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>{albumDetails.name}</h1>
      <img
        src={albumDetails.image || "/placeholder.jpg"}
        alt={albumDetails.name}
        style={{ borderRadius: "8px", width: "300px", height: "300px" }}
      />
      <p style={{ fontSize: "16px", color: "#555" }}>
        Release Date: {albumDetails.releaseDate}
      </p>
      <p style={{ fontSize: "16px", color: "#555" }}>
        Total Tracks: {albumDetails.totalTracks}
      </p>
      <h2>Tracks</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {albumDetails.tracks.map((track: any, index: number) => (
          <li
            key={index}
            style={{
              padding: "10px",
              borderBottom: "1px solid #ddd",
              textAlign: "left",
            }}
          >
            {index + 1}. {track.name}
          </li>
        ))}
      </ul>
    </div>
  );
}