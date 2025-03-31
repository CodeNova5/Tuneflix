const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
let spotifyAccessToken = null;
let spotifyTokenExpiresAt = 0;
import axios from "axios";
import { createDecipheriv } from "crypto";

const audio = [92, 128, 256, 320];

const hexcode = (hex) => Buffer.from(hex, "hex");

const decode = (enc) => {
  try {
    const secret_key = "C5D58EF67A7584E4A29F6C35BBC4EB12";
    const data = Buffer.from(enc, "base64");
    const iv = data.slice(0, 16);
    const content = data.slice(16);
    const key = hexcode(secret_key);

    const decipher = createDecipheriv("aes-128-cbc", key, iv);
    let decrypted = Buffer.concat([decipher.update(content), decipher.final()]);

    return JSON.parse(decrypted.toString());
  } catch (error) {
    throw new Error(error.message);
  }
};

function getYouTubeVideoId(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|v\/|embed\/|user\/[^\/\n\s]+\/)?(?:watch\?v=|v%3D|embed%2F|video%2F)?|youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function savetube(link, quality, value) {
  try {
    const cdn = (await axios.get("https://media.savetube.me/api/random-cdn")).data.cdn;
    const infoget = (
      await axios.post(
        "https://" + cdn + "/v2/info",
        {
          url: link,
        },
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36",
            Referer: "https://yt.savetube.me/1kejjj1?id=362796039",
          },
        }
      )
    ).data;
    const info = decode(infoget.data);
    const response = (
      await axios.post(
        "https://" + cdn + "/download",
        {
          downloadType: value,
          quality: `${quality}`,
          key: info.key,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36",
            Referer: "https://yt.savetube.me/start-download?from=1kejjj1%3Fid%3D362796039",
          },
        }
      )
    ).data;
    return {
      status: true,
      quality: `${quality}kbps`,
      availableQuality: audio,
      url: response.data.downloadUrl,
      filename: `${info.title} (${quality}kbps).mp3`,
    };
  } catch (error) {
    console.error("Converting error:", error);
    return {
      status: false,
      message: "Converting error",
    };
  }
}

async function ytmp3(link, formats = 128) {
  const videoId = getYouTubeVideoId(link);
  const format = audio.includes(Number(formats)) ? Number(formats) : 128;
  if (!videoId) {
    return {
      status: false,
      message: "Invalid YouTube URL",
    };
  }
  try {
    let url = "https://youtube.com/watch?v=" + videoId;
    let response = await savetube(url, format, "audio");
    return {
      status: true,
      download: response,
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: error.response ? `HTTP Error: ${error.response.status}` : error.message,
    };
  }
}

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
        )}&type=track&limit=30`;

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
    else if (type === "artistDetails") {
      if (!artistName) {
        return res.status(400).json({ error: "Missing artist name" });
      }

      try {
        const accessToken = await getSpotifyAccessToken();
        const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          decodedArtistName
        )}&type=artist&limit=1`;

        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch artist details");
        }

        const data = await response.json();
        if (!data.artists?.items?.length) {
          return res.status(404).json({ error: "Artist not found" });
        }

        const artist = data.artists.items[0];
        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json({
          name: artist.name,
          image: artist.images[0]?.url || null,
          genres: artist.genres || [],
          followers: artist.followers?.total || 0,
        });
      } catch (err) {
        console.error("Spotify API Error:", err);
        return res.status(500).json({ error: "Failed to fetch artist details" });
      }
    }
    else if (type === "youtubeToMp3") {
      const { videoUrl, quality } = req.query;

      if (!videoUrl) {
        return res.status(400).json({ error: "Missing videoUrl parameter" });
      }
    
      try {
        const result = await ytmp3(videoUrl, quality || 128);
        if (result.status) {
          return res.status(200).json(result.download);
        } else {
          return res.status(500).json({ error: result.message });
        }
      } catch (error) {
        console.error("Error processing request:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
    else {
      return res.status(400).json({ error: "Invalid type parameter" });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}