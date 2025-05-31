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
          console.log("Artists", data.trackArtists);
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
        {albumDetails.tracks.map((track: any, index: number) => {
          // Find artists for this track using trackArtists
          let artists: string[] = [];
          console.log("Track Artists:", albumDetails.trackArtists);
          if (Array.isArray(albumDetails.trackArtists)) {
            const found = albumDetails.trackArtists.find(
              (t: any) => t.track === track.name
            );
            if (found && Array.isArray(found.artists)) {
              artists = found.artists;
            }
          }
          // Fallback to track.artists if needed
          if (!artists.length && Array.isArray(track.artists)) {
            artists = track.artists.map((a: any) => a.name);
          }
          // Use the first artist for the link, or "unknown"
          const artistName = artists[0] || "unknown";

          return (
            <li
              key={index}
              style={{
                padding: "10px",
                borderBottom: "1px solid #ddd",
                textAlign: "left",
              }}
            >
              <Link
                href={`/music/${encodeURIComponent(artistName)}/song/${encodeURIComponent(track.name)}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {index + 1}. {track.name}{" "}
                <span style={{ color: "#aaa", fontSize: "14px" }}>
                  by {artists.join(", ")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Footer />
    </div>
  );
}
