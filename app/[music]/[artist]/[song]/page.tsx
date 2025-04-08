"use client";
import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CommentSection from '../../../../components/CommentSection';
interface Track {
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
    release_date: string; // Release date of the album
    type: string; // Type of the album (e.g., "album", "single")
  };
  preview_url: string | null;
  duration_ms: number; // Duration of the track in milliseconds
}

export default function Page() {
  const { artist, song } = useParams() as { artist: string; song: string };
  const [track, setTrack] = React.useState<Track | null>(null);
  const [videoId, setVideoId] = React.useState<string | null>(null);
  // Add a new state for lyrics video ID
  const [lyricsVideoId, setLyricsVideoId] = React.useState<string | null>(null);

  const [songs, setSongs] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [modalMessage, setModalMessage] = React.useState<string | null>(null);
  const [artistDetails, setArtistDetails] = React.useState<{ genres: string[] } | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Disable background scroll when modal is open
  React.useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = ""; // Reset scrolling
    }

    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  React.useEffect(() => {
    if (lyricsVideoId && !downloadUrl) {
      handleConvertToMp3();
    }
  }, [lyricsVideoId]);


  React.useEffect(() => {

    async function fetchArtistDetails() {
      try {
        const response = await fetch(
          `/api/Music/route?type=artistDetails&artistName=${encodeURIComponent(artist)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch artist details");
        }
        const data = await response.json();
        setArtistDetails(data);
      } catch (err) {
        console.error("Error fetching artist details:", err);
        setError("An unexpected error occurred");
      }
    }

    if (artist) {
      fetchArtistDetails();
    }
  }, [artist]);

  React.useEffect(() => {
    if (artist && song) {
      async function fetchData() {
        try {
          // Fetch song details
          const response = await fetch(
            `/api/Music/route?type=songDetails&artistName=${encodeURIComponent(
              artist
            )}&songName=${encodeURIComponent(song)}`
          );
          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.error || "Failed to fetch song details");
            return;
          }
          const trackData = await response.json();
          setTrack(trackData);

          // Fetch YouTube video
          const videoResponse = await fetch(
            `/api/Music/route?type=youtubeMusicVideo&artistName=${encodeURIComponent(
              artist
            )}&songName=${encodeURIComponent(song)}`
          );
          const videoData = await videoResponse.json();
          if (videoData.videoId) {
            setVideoId(videoData.videoId);
          }

          // Fetch and display lyrics
          await fetchAndDisplayLyrics(artist, song);

          // Fetch lyrics video
          const lyricsVideoResponse = await fetch(
            `/api/Music/route?type=lyricsVideo&artistName=${encodeURIComponent(
              artist
            )}&songName=${encodeURIComponent(song)}`
          );
          const lyricsVideoData = await lyricsVideoResponse.json();
          if (lyricsVideoData.videoId) {
            setLyricsVideoId(lyricsVideoData.videoId);
          }

        } catch (err) {
          console.error("Error fetching data:", err);
          setError("An unexpected error occurred");
        }
      }

      fetchData();
    }
  }, [artist, song]);

  async function fetchAndDisplayLyrics(artistName: string, songName: string) {
    try {
      const response = await fetch(
        `/api/Music/route?type=lyrics&artistName=${encodeURIComponent(
          artistName
        )}&songName=${encodeURIComponent(songName)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch lyrics");
      }

      const data = await response.json();
      if (data.lyrics) {
        const formattedLyrics = formatLyrics(data.lyrics);
        const lyricsContainer = document.getElementById("lyrics-container");
        if (lyricsContainer) {
          lyricsContainer.innerHTML = formattedLyrics;
        }
      } else {
        throw new Error("Lyrics not found");
      }
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      const lyricsContainer = document.getElementById("lyrics-container");
      if (lyricsContainer) {
        lyricsContainer.textContent = "Failed to load lyrics.";
      }
    }
  }


  function formatLyrics(lyrics: string) {
    return lyrics
      .replace(/(.*?)/g, '<div class="lyrics-section"><strong>[$1]</strong></div>')
      .replace(/\n/g, "<br>");
  }
  async function fetchSongs(songName: string) {
    try {
      const response = await fetch(
        `/api/Music/route?type=artistSongs&artistName=${encodeURIComponent(artist)}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch songs");
        return;
      }
      const songsData = await response.json();

      // Filter out duplicates and the current song
      const filteredSongs = songsData
        .filter(
          (song: any, index: number, self: any[]) =>
            song.name.toLowerCase() !== songName.toLowerCase() && // Exclude the current song
            self.findIndex((s) => s.name.toLowerCase() === song.name.toLowerCase()) === index // Remove duplicates
        )
      setSongs(filteredSongs);
    } catch (err) {
      console.error("Error fetching songs:", err);
      setError("An unexpected error occurred");
    }
  }
  fetchSongs(song);


  async function handleConvertToMp3() {
    if (!lyricsVideoId) return;
    const formatTitle = (title: string): string =>
      title
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("-");

    const songName = `${formatTitle(track?.artists[0]?.name ?? "")}_-_${formatTitle(track?.name ?? "")}`;

    try {
      const response = await fetch(
        `https://video-downloader-server.fly.dev/download?url=https://www.youtube.com/watch?v=${lyricsVideoId}&type=audio&filename=${songName}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        setModalMessage(errorData.error || "Failed to convert video to MP3");
        setIsUploading(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.id = "download-link"; // Set an ID for the link
      a.href = url;
      a.download = songName + '.mp3'; // Use the formatted song name as the filename
      document.body.appendChild(a);
      setDownloadUrl(url); // 🔥 Store blob URL
    } catch (err) {
      console.error("Error converting video to MP3:", err);
      setModalMessage("An unexpected error occurred");
    } finally {
      setTimeout(() => {
        setModalMessage(null);
        setIsUploading(false);
      }, 2000);
    }
  }


  if (error) {
    return <h1>{error}</h1>;
  }

  if (!track) {
    return <h1>Loading...</h1>;
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>{track.name}</h1>
      <h2>by {track.artists.map((a) => a.name).join(", ")}</h2>
      <img src={track.album.images[0]?.url} alt={track.name} width="300" />

      {/* Song Details Table */}
      <table style={{ margin: "20px auto", borderCollapse: "collapse", width: "80%" }}>
        <tbody>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Detail</th>
            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Value</th>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Artist(s)</td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
              {track.artists.map((a) => a.name).join(", ")}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Album</td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{track.album.name}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Duration</td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
              {track.duration_ms
                ? `${Math.floor(track.duration_ms / 60000)}:${(
                  (track.duration_ms % 60000) /
                  1000
                )
                  .toFixed(0)
                  .padStart(2, "0")}`
                : "N/A"}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Release Date</td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
              {track.album.release_date || "N/A"}
            </td>
          </tr>
        </tbody>
      </table>


      <div id="youtube-video" style={{ marginTop: "20px" }}>
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            allowFullScreen

            height="315"
            style={{ width: "90%" }}
          ></iframe>
        ) : (
          <p>No video available for this song.</p>
        )}
      </div>
      {/* Convert to MP3 Button */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleConvertToMp3}
          disabled={isUploading}
          style={{
            padding: "10px 20px",
            backgroundColor: isUploading ? "#ccc" : "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: isUploading ? "not-allowed" : "pointer",
          }}
        >
          {isUploading ? "Converting..." : "Convert to MP3"}
        </button>
      </div>

      <a
        download={
          downloadUrl
            ? `${track?.artists[0]?.name.replace(/ /g, "-")}_${track?.name.replace(/ /g, "-")}.mp3`
            : undefined
        }
        onClick={async (e) => {
          if (!downloadUrl) {
            e.preventDefault(); // Prevent default anchor behavior
            setIsUploading(true);
            setModalMessage(" Preparing Your song For Download...");
            // MutationObserver to monitor for the addition of the #download-link element
            const observer = new MutationObserver((mutationsList) => {
              mutationsList.forEach((mutation) => {
                // Check if the added node is the download-link element
                if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach((node) => {
                    if ((node as HTMLElement).id === 'download-link') {
                      console.log('Download link has been added to the DOM');
                      // Perform any other action needed once the element is found
                      observer.disconnect(); // Stop observing once the element is found
                    }
                  });
                }
              });
            });

            // Configure the MutationObserver to watch for child node additions to the body
            observer.observe(document.body, { childList: true, subtree: true });

          }
        }}
        style={{
          display: "inline-block",
          marginTop: "15px",
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "#fff",
          borderRadius: "5px",
          textDecoration: "none",
          cursor: "pointer",
        }}
      >
        🎵 Download MP3
      </a>

      {/* Spinner Modal */}
      {
        modalMessage && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.7)", // darker overlay
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "#1e1e1e", // dark background
                padding: "20px",
                borderRadius: "8px",
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)",
                color: "#fff", // white text
              }}
            >
              {modalMessage === "Downloading Song..." ? (
                <div>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      border: "5px solid #444",
                      borderTop: "5px solid #00bfff", // bright spinner color
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto 20px",
                    }}
                  ></div>
                  <p>{modalMessage}</p>
                </div>
              ) : (
                <p style={{ fontSize: "18px", fontWeight: "bold" }}>{modalMessage}</p>
              )}
            </div>
          </div>
        )
      }

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <button
        onClick={toggleModal}
        style={{
          padding: "10px 20px",
          backgroundColor: "#333333", // Dark mode button background
          color: "#ffffff", // Button text color
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {isModalOpen ? "Close Comments" : "Open Comments"}
      </button>

      {
        isModalOpen && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "80%",
              backgroundColor: "#1e1e1e", // Dark mode modal background
              color: "#ffffff", // Modal text color
              boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.2)",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                position: "sticky", // Keeps the header fixed at the top
                top: 0,
                backgroundColor: "#1e1e1e", // Match modal background
                zIndex: 1001, // Ensure it stays above the content
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 20px",
                borderBottom: "1px solid #444", // Dark mode border
              }}
            >
              <h2>Comments</h2>
              <button
                onClick={toggleModal}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "20px",
                  color: "#ffffff", // Close button color
                  cursor: "pointer",
                }}
              >
                ✖
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <CommentSection />
            </div>
          </div>
        )
      }

      {/* Lyrics Section */}
      <div id="lyrics-container" style={{ marginTop: "20px", textAlign: "left" }}>
        <h3>Lyrics:</h3>
        <p>Loading lyrics...</p>
      </div>
      <h1>Songs by {track.artists[0]?.name}</h1>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "20px",
          padding: "10px",
        }}
      >
        {songs.map((song, index) => (
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
            <Link href={`/music/${encodeURIComponent(song.artists[0]?.name)}/${encodeURIComponent(song.name)}`}>
              <a style={{ textDecoration: "none", color: "inherit" }}>
                <img
                  src={song.album.images[0]?.url || "/placeholder.jpg"}
                  alt={song.name}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
                <h3 style={{ fontSize: "16px", margin: "10px 0" }}>{song.name}</h3>
                <p style={{ fontSize: "14px", color: "#555" }}>
                  {song.artists.map((a: any) => a.name).join(", ")}
                </p>
              </a>
            </Link>
          </div>
        ))}
      </div>
    </div >
  );
}