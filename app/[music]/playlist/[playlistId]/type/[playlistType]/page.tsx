import { Metadata } from "next";
import PlaylistClientPage from "./PlaylistClientPage";

// Server-side metadata generation
export async function generateMetadata(props: any): Promise<Metadata> {
  const params = typeof props.params?.then === "function" ? await props.params : props.params;
  const { playlistId, playlistType } = params;

  const baseUrl = "https://next-xi-opal.vercel.app";
  const apiUrl = `${baseUrl}/api/Music/route?type=playlist&playlistId=${playlistId}&playlistType=${playlistType}`;

  const res = await fetch(apiUrl, { cache: "no-store" });
  if (!res.ok) {
    return {
      title: "Playlist Not Found | Tuneflix",
      description: "Sorry, this playlist could not be found.",
    };
  }
  const data = await res.json();

  const title = `${data.playlistDetails?.name || "Playlist"} | Tuneflix`;
  const description = `Listen to the playlist "${data.playlistDetails?.name || ""}" on Tuneflix.`;
  const image = data.playlistDetails?.image || "/placeholder.jpg";
  const url = `${baseUrl}/music/playlist/${encodeURIComponent(playlistId)}/type/${encodeURIComponent(playlistType)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "music.playlist",
      siteName: "Tuneflix",
      images: [
        {
          url: image,
          alt: `${data.playlistDetails?.name || "Playlist"} cover`,
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

export default function Page() {
  return <PlaylistClientPage />;
}