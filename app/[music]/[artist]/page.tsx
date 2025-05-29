import { Metadata } from "next";
import ArtistPage from "./ArtistPage";

// Server-side metadata generation
export async function generateMetadata(props: any): Promise<Metadata> {
  const params = typeof props.params?.then === "function" ? await props.params : props.params;
  const { artist } = params;

  const baseUrl = "https://next-xi-opal.vercel.app";
  const apiUrl = `${baseUrl}/api/Music/route?type=artistDetails&artistName=${encodeURIComponent(artist)}`;

  const res = await fetch(apiUrl, { cache: "no-store" });
  if (!res.ok) {
    return {
      title: "Song Not Found | Tuneflix",
      description: "Sorry, this song could not be found.",
    };
  }

  const artistDetails = await res.json();
  const title = `${artistDetails.name}`;
  const description = `Check out this artist "${artistDetails.name}". View songs, albums, and more on Tuneflix.`;
  const image = artistDetails.image;
  const url = `${baseUrl}/music/${encodeURIComponent(artist)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      siteName: "Tuneflix",
      images: [
        {
          url: image,
          alt: `${artistDetails.name} album cover`,
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

// ✅ This MUST be outside the function, at the top level
export default function Page() {
  return <ArtistPage />;
}