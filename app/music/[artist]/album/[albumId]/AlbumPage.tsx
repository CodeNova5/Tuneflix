"use client";
import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CommentShareModule from "@/components/CommentShareModule";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export default function AlbumPage() {
  const { artist, albumId } = useParams() as { artist: string; albumId: string };
  const [albumDetails, setAlbumDetails] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (artist && albumId) {
      async function fetchAlbumDetails() {
        try {
          const response = await fetch(
            `/api/Music/route?type=albumDetail&artistName=${encodeURIComponent(
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
          console.log("Data:", data); // <-- LOG IT HERE
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
    <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#111", marginTop: "40px" }}>
      <Header />
      <h1 style={{ fontSize: "25px" }}>{albumDetails.name}</h1>
      <img
        src={albumDetails.image || "/placeholder.jpg"}
        alt={albumDetails.name}
        style={{ borderRadius: "8px", width: "300px", height: "300px" }}
      />
      <p style={{ fontSize: "16px", color: "white" }}>
        Release Date: {albumDetails.releaseDate}
      </p>
      <p style={{ fontSize: "16px", color: "white" }}>
        Total Tracks: {albumDetails.totalTracks}
      </p>

      <CommentShareModule
        playlist={undefined}
        track={undefined}
        album={albumDetails}
        artist={undefined}
      />
      <h2>Tracks</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
         {albumDetails.tracks.map((track: any, index: number) => (
            <Link
              key={index}
              href={`/music/${encodeURIComponent(track.artists?.[0]?.name)}/song/${encodeURIComponent(track.name)}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <li
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                {index + 1}. {track.name}
              </li>
            </Link>
        ))}
      </ul>
      <Footer />
    </div>
  );
}
