"use client";
import React from "react";
import { useParams } from "next/navigation";
import axios from "axios";

interface Track {
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  preview_url: string | null;
}

export default function Page() {
  const { artist, song } = useParams() as { artist: string; song: string };
  const [track, setTrack] = React.useState<Track | null>(null);
  const [videoId, setVideoId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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
      const response = await axios.get(`/api/lyrics/${artistName}/${songName}`);
      if (response.data && response.data.lyrics) {
        const formattedLyrics = formatLyrics(response.data.lyrics);
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
      .replace(/\n/g, "<br><br>");
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
      <p>Album: {track.album.name}</p>
      <img src={track.album.images[0]?.url} alt={track.name} width="300" />
      {track.preview_url && (
        <audio controls>
          <source src={track.preview_url} type="audio/mpeg" />
          Your browser does not support the audio tag.
        </audio>
      )}
      <div id="youtube-video" style={{ marginTop: "20px" }}>
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            allowFullScreen
            width="560"
            height="315"
          ></iframe>
        ) : (
          <p>No video available for this song.</p>
        )}
      </div>
      <div id="lyrics-container" style={{ marginTop: "20px", textAlign: "left" }}>
        <h3>Lyrics:</h3>
        <p>Loading lyrics...</p>
      </div>
    </div>
  );
}