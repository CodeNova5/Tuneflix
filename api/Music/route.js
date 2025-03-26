const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

let spotifyAccessToken = null;
let spotifyTokenExpiresAt = 0;

async function getSpotifyAccessToken() {
  if (spotifyAccessToken && Date.now() < spotifyTokenExpiresAt) {
    return spotifyAccessToken;
  }

  const authString = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenResponse.ok) throw new Error("Failed to get access token");

  const tokenData = await tokenResponse.json();
  spotifyAccessToken = tokenData.access_token;
  spotifyTokenExpiresAt = Date.now() + tokenData.expires_in * 1000;
  return spotifyAccessToken;
}

export default async function handler(req, res) {
  try {
    const { type, artistName, songName } = req.query;

    if (!type) {
      return res.status(400).json({ error: "Missing type parameter (spotify, youtube, lyrics, thisIsPlaylist)" });
    }

    const decodedArtistName = decodeURIComponent(artistName || "");
    const decodedSongName = decodeURIComponent(songName || "");

    if (type === "thisIsPlaylist") {
      if (!artistName) {
        return res.status(400).json({ error: "Missing artist name" });
      }

      try {
        const accessToken = await getSpotifyAccessToken();
        const query = `This Is ${decodedArtistName}`;
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=5`;
        
        const searchResponse = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (!searchResponse.ok) throw new Error("Failed to fetch playlist");
        
        const searchData = await searchResponse.json();
        let playlist = searchData.playlists.items.find(p => p.name.toLowerCase().includes("this is"));
        
        if (!playlist) {
          return res.status(404).json({ error: `No 'This Is' playlist found for artist: ${artistName}` });
        }

        const playlistResponse = await fetch(
          `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!playlistResponse.ok) throw new Error("Failed to fetch playlist tracks");

        const playlistData = await playlistResponse.json();
        const tracks = playlistData.items.map(item => ({
          name: item.track.name,
          album: {
            name: item.track.album.name,
            images: item.track.album.images,
          },
        }));

        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json({ tracks });
      } catch (err) {
        console.error("Spotify API Error:", err);
        return res.status(500).json({ error: "Failed to fetch playlist" });
      }
    }

    return res.status(400).json({ error: "Invalid type parameter" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
