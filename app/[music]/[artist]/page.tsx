"use client";
import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
  const [relatedArtists, setRelatedArtists] = React.useState<any[]>([]);
  const [artistAlbums, setArtistAlbums] = React.useState<any[]>([]);
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

          // Fetch top tracks
          const tracksResponse = await fetch(
            `/api/Music/route?type=artistSongs&artistName=${encodeURIComponent(artist)}`
          );
          if (!tracksResponse.ok) {
            const errorData = await tracksResponse.json();
            setError(errorData.error || "Failed to fetch songs");
            return;
          }
          const tracksData = await tracksResponse.json();
          const filteredTracks = tracksData.filter(
            (track: any, index: number, self: any[]) =>
              index === self.findIndex((t) => t.name === track.name)
          );
          setTopTracks(filteredTracks);

          // Fetch related artists
          const relatedArtistsResponse = await fetch(
            `/api/Music/route?type=relatedArtists&artistName=${encodeURIComponent(artist)}`
          );
          if (!relatedArtistsResponse.ok) {
            const errorData = await relatedArtistsResponse.json();
            setError(errorData.error || "Failed to fetch related artists");
            return;
          }
          const relatedArtistsData = await relatedArtistsResponse.json();
          setRelatedArtists(relatedArtistsData);

          // Fetch artist albums
          const albumsResponse = await fetch(
            `/api/Music/route?type=artistAlbums&artistName=${encodeURIComponent(artist)}`
          );
          if (!albumsResponse.ok) {
            const errorData = await albumsResponse.json();
            setError(errorData.error || "Failed to fetch artist albums");
            return;
          }
          const albumsData = await albumsResponse.json();
          setArtistAlbums(albumsData);
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
            <Link href={`/music/${track.artists[0].name}/${encodeURIComponent(track.name)}`}>
              <a style={{ textDecoration: "none", color: "inherit" }}>
                <img
                  src={track.album.images[0]?.url || "/placeholder.jpg"}
                  alt={track.name}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
                <h3 style={{ fontSize: "16px", margin: "10px 0" }}>{track.name}</h3>
                <p style={{ fontSize: "14px", color: "#555" }}>
                  {track.artists.map((a) => a.name).join(", ")}
                </p>
              </a>
            </Link>
          </div>
        ))}
      </div>
      <h2>Albums</h2>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "20px",
          padding: "10px",
        }}
      >
        {artistAlbums.length > 0 ? (
          artistAlbums.map((album, index) => (
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
              <Link href={`/music/${album?.artists[0].name}/${encodeURIComponent(album.name)}`}>
                <a
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img
                    src={album.image}
                    alt={album.name}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                  <h3 style={{ fontSize: "16px", margin: "10px 0" }}>{album.name}</h3>
                  <p style={{ fontSize: "14px", color: "#555" }}>
                    {album.releaseDate}
                  </p>
                </a>
                <a
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img
                    src={album.image}
                    alt={album.name}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                  <h3 style={{ fontSize: "16px", margin: "10px 0" }}>{album.name}</h3>
                  <p style={{ fontSize: "14px", color: "#555" }}>
                    {album.releaseDate}
                  </p>
                  <p style={{ fontSize: "14px", color: "#555" }}>
                    Tracks: {album.totalTracks}
                  </p>
                </a>
              </Link>
            </div>
          ))
        ) : (
          <p>No albums found.</p>
        )}
      </div>
      <h2>Related Artists</h2>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "20px",
          padding: "10px",
        }}
      >
        {relatedArtists.length > 0 ? (
          relatedArtists.map((artist, index) => (
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
              <Link href={`/music/${artist?.name}`}>
                <a
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img
                    src={artist.image}
                    alt={artist.name}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                  <h3 style={{ fontSize: "16px", margin: "10px 0" }}>{artist.name}</h3>
                </a>
              </Link>
            </div>
          ))
        ) : (
          <p>No related artists found.</p>
        )}
      </div>
    </div>
  );
}