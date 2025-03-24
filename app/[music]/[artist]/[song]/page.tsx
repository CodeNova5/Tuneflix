import axios from "axios";

interface TrackProps {
  params: { artist: string; song: string };
}

async function getSongDetails(artist: string, song: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

  const tokenResponse = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const accessToken = tokenResponse.data.access_token;

  const searchResponse = await axios.get(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}%20${encodeURIComponent(song)}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return searchResponse.data.tracks.items[0] || null;
}

export default async function Page({ params }: TrackProps) {
  const track = await getSongDetails(params.artist, params.song);

  if (!track) return <h1>Song not found</h1>;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>{track.name}</h1>
      <h2>by {track.artists.map((a: any) => a.name).join(", ")}</h2>
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