import axios from "axios";

export async function getServerSideProps({ params }) {
  const { artist, song } = params;

  // Spotify API credentials
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  // Get Spotify access token
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

  // Search for the song
  const searchResponse = await axios.get(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}%20${encodeURIComponent(song)}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const track = searchResponse.data.tracks.items[0];

  if (!track) {
    return { notFound: true };
  }

  return {
    props: {
      track: {
        name: track.name,
        artist: track.artists.map(a => a.name).join(", "),
        album: track.album.name,
        image: track.album.images[0]?.url,
        preview_url: track.preview_url,
      },
    },
  };
}

export default function MusicPage({ track }) {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>{track.name}</h1>
      <h2>by {track.artist}</h2>
      <p>Album: {track.album}</p>
      <img src={track.image} alt={track.name} width="300" />
      {track.preview_url && (
        <audio controls>
          <source src={track.preview_url} type="audio/mpeg" />
          Your browser does not support the audio tag.
        </audio>
      )}
    </div>
  );
                                                    }
