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
      return res.status(400).json({ error: "Missing type parameter (spotify or youtube)" });
    }

    // Decode before using
    const decodedArtistName = decodeURIComponent(artistName || "");
    const decodedSongName = decodeURIComponent(songName || "");

    if (type === "songDetails") {
      if (!artistName || !songName) {
        return res.status(400).json({ error: "Missing artist or song" });
      }

      try {
        const accessToken = await getSpotifyAccessToken();
        const query = `${decodedArtistName} ${decodedSongName}`;
        const searchResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!searchResponse.ok) throw new Error("Failed to fetch song details");

        const searchData = await searchResponse.json();
        if (!searchData.tracks?.items?.length) {
          return res.status(404).json({ error: "Song not found" });
        }

        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json(searchData.tracks.items[0]);
      } catch (err) {
        console.error("Spotify API Error:", err);
        return res.status(500).json({ error: "Failed to fetch song details" });
      }
    } else if (type === "youtubeMusicVideo") {
      if (!YOUTUBE_API_KEY) {
        console.error("Missing YouTube API key.");
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!songName || !artistName) {
        return res.status(400).json({ error: "Missing song name or artist name" });
      }

      try {
        const query = `${decodedArtistName} ${decodedSongName} official music video`;
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`;

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch YouTube video");

        const data = await response.json();
        if (!data.items || data.items.length === 0) {
          return res.status(404).json({ error: "No video found for this song" });
        }

        const videoId = data.items[0].id.videoId;
        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json({ videoId });
      } catch (err) {
        console.error("YouTube API Error:", err);
        return res.status(500).json({ error: "Failed to fetch YouTube video" });
      }
    } else if (type === "lyrics") {
      if (!artistName || !songName) {
        return res.status(400).json({ error: "Missing artist name or song name" });
      }

      try {
        const lyricsApiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(decodedArtistName)}/${encodeURIComponent(decodedSongName)}`;
        const response = await fetch(lyricsApiUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch lyrics");
        }

        const data = await response.json();
        if (!data.lyrics) {
          return res.status(404).json({ error: "Lyrics not found" });
        }

        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json({ lyrics: data.lyrics });
      } catch (err) {
        console.error("Lyrics API Error:", err);
        return res.status(500).json({ error: "Failed to fetch lyrics" });
      }
    }
     else if (type === "artistSongs") {
      if (!artistName) {
        return res.status(400).json({ error: "Missing artist name" });
      }
    
      try {
        const accessToken = await getSpotifyAccessToken();
        const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          decodedArtistName
        )}&type=track&limit=20`;
    
        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
    
        if (!response.ok) {
          throw new Error("Failed to fetch artist's songs");
        }
    
        const data = await response.json();
        if (!data.tracks?.items?.length) {
          return res.status(404).json({ error: "No songs found for this artist" });
        }
    
        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json(data.tracks.items);
      } catch (err) {
        console.error("Spotify API Error:", err);
        return res.status(500).json({ error: "Failed to fetch artist's songs" });
      }
    }
     else {
      return res.status(400).json({ error: "Invalid type parameter (use 'spotify', 'youtube', 'lyrics', or 'thisIsPlaylist')" });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}