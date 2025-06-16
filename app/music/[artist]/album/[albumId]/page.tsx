import { Metadata } from "next";
import AlbumPage from "./AlbumPage";

// Server-side metadata generation
export async function generateMetadata(props: any): Promise<Metadata> {
  const params = typeof props.params?.then === "function" ? await props.params : props.params;
  const { albumId } = params;

  const baseUrl = "https://next-xi-opal.vercel.app";
  const apiUrl = `${baseUrl}/api/Music/route?type=albumDetail&albumId=${encodeURIComponent(albumId)}`;

  const res = await fetch(apiUrl, { cache: "no-store" });
  if (!res.ok) {
    return {
      title: "Album Not Found | Tuneflix",
      description: "Sorry, this album could not be found.",
    };
  }

  const albumDetails = await res.json();
  const title = `${albumDetails.name}`;
  const description = `Explore the album "${albumDetails.name}" featuring tracks, artist info, and more on Tuneflix.`;
  const image = albumDetails.image;
  const url = `${baseUrl}/album/${encodeURIComponent(albumId)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "music.album", // ✅ Correct Open Graph type
      siteName: "Tuneflix",
      images: [
        {
          url: image,
          alt: `${albumDetails.name} cover art`,
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

// ✅ Component must be outside metadata function
export default function Page() {
  return <AlbumPage />;
}