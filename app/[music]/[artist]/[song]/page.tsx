import { PageProps } from "next";

interface TrackProps extends PageProps {
  params: { artist: string; song: string };
}

interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  preview_url: string | null;
}

async function getSongDetails(artist: string, song: string): Promise<SpotifyTrack | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

  try {
    // Get Spotify access token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) throw new Error("Failed to get access token");

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch song details
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}%20${encodeURIComponent(song)}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!searchResponse.ok) throw new Error("Failed to fetch song details");

    const searchData = await searchResponse.json();
    return searchData.tracks.items[0] || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function Page({ params }: { params: { artist: string; song: string } }) {
  if (!params) return <h1>Invalid parameters</h1>;

  const track = await getSongDetails(params.artist, params.song);

  if (!track) return <h1>Song not found</h1>;

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
    </div>
  );
}
