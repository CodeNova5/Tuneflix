import { Metadata } from "next";
import SongPage from "./SongPage";

// Server-side metadata generation
export async function generateMetadata(props: any): Promise<Metadata> {
  const { artist, song } = props.params;

  // Fetch song details from your API
  const res = await fetch(
    `/api/Music/route?type=songDetails&artistName=${encodeURIComponent(artist)}&songName=${encodeURIComponent(song)}`
  );
  if (!res.ok) {
    return {
      title: "Song Not Found | Tuneflix",
      description: "Sorry, this song could not be found.",
    };
  }
  const track = await res.json();

  const title = `${track.name} by ${track.artists.map((a: { name: string }) => a.name).join(", ")} | Tuneflix`;
  const description = `Listen to "${track.name}" by ${track.artists.map((a: { name: string }) => a.name).join(", ")}. View album details, lyrics, YouTube video, and more on Tuneflix.`;
  const image = track.album?.images?.[0]?.url || "https://tuneflix.com/images/og-image.jpg";
  const url = `https://tuneflix.com/music/${encodeURIComponent(artist)}/song/${encodeURIComponent(song)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "music.song",
      siteName: "Tuneflix",
      images: [
        {
          url: image,
          alt: `${track.name} album cover`,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    authors: [{ name: "Code Nova" }],
  };
}

// Your page component (can remain as-is)
export default function Page() {
  return <SongPage />;
}