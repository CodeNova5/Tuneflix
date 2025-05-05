// app/page.tsx
import { Metadata } from "next";
import HomePage from "./HomePage"; // client component

export const metadata: Metadata = {
  title: 'Tuneflix',
  description: 'Get instant access to millions of songs, albums, and playlists. Discover new music, revisit old favorites, and let every moment have its perfect soundtrack — anytime, anywhere.',
  keywords: ['music', 'top songs', 'trending artists', 'genres', 'moods', 'anime songs', 'country songs', 'kids songs', 'Tuneflix', 'Playlists'],
  authors: [{ name: 'Code Nova' }],
  openGraph: {
    title: 'Tuneflix',
    description: 'Get access to millions of songs on Tuneflix. Stream and discover the latest hits from your favorite artists.',
    url: 'https://tuneflix.com',
    type: 'website',
    siteName: 'Tuneflix',
    images: [
      {
        url: 'https://tuneflix.com/images/og-image.jpg',
        alt: 'Tuneflix logo',
      },
    ],
    locale: 'en_US',
  },
};

export default function Page() {
  return <HomePage />;
}
