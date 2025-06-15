import { Metadata } from "next";
import SongPage from "./SongPage";

// Server-side metadata generation
export async function generateMetadata(props: any): Promise<Metadata> {
  // Await params if needed (for dynamic routes)
  const params = typeof props.params?.then === "function" ? await props.params : props.params;
  const { artist, song } = params;

  // Use absolute URL for server-side fetch
  const baseUrl = "https://next-xi-opal.vercel.app"; // fallback to your production domain

  const apiUrl = `${baseUrl}/api/Music/route?type=songDetails&artistName=${encodeURIComponent(
    artist
  )}&songName=${encodeURIComponent(song)}`;

  const res = await fetch(apiUrl, { cache: "no-store" });
  if (!res.ok) {
    return {
      title: "Song Not Found | Tuneflix",
      description: "Sorry, this song could not be found.",
    };
  }
  const track = await res.json();

  const title = `${track.name} by ${track.artists.map((a: { name: string }) => a.name).join(", ")} | Tuneflix`;
  const description = `Listen to "${track.name}" by ${track.artists.map((a: { name: string }) => a.name).join(", ")}. View album details, lyrics, YouTube video, and more on Tuneflix.`;
  const image = track.album?.images?.[0]?.url;
  const url = `${baseUrl}/music/${encodeURIComponent(artist)}/song/${encodeURIComponent(song)}`;

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