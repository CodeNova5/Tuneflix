"use client";
import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AlbumPage() {
  const { artist, albumId } = useParams() as { artist: string; albumId: string };
  const [albumDetails, setAlbumDetails] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (artist && albumId) {
      async function fetchAlbumDetails() {
        try {
          const response = await fetch(
            `/api/Music/route?type=albumDetails&artistName=${encodeURIComponent(
              artist
            )}&albumId=${encodeURIComponent(albumId)}`
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
  }, [artist, albumId]);

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
          <Link href={`/music/${decodeURIComponent(artist)}/song/${encodeURIComponent(track.name)}`}
          >
            <a style={{ textDecoration: "none", color: "inherit" }}>
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
            </a>
          </Link>
        ))}
      </ul>
    </div>
  );
}