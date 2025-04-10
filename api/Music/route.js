const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const ARTIST_CLIENT_ID = process.env.ARTIST_CLIENT_ID;
const ARTIST_CLIENT_SECRET = process.env.ARTIST_CLIENT_SECRET;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
let spotifyAccessToken = null;
let spotifyTokenExpiresAt = 0;
let artistAccessToken = null;
let artistTokenExpiresAt = 0;
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

async function getArtistAccessToken() {
  if (artistAccessToken && Date.now() < artistTokenExpiresAt) {
    return artistAccessToken;
  }

  const authString = Buffer.from(`${ARTIST_CLIENT_ID}:${ARTIST_CLIENT_SECRET}`).toString("base64");
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
  artistAccessToken = tokenData.access_token;
  artistTokenExpiresAt = Date.now() + tokenData.expires_in * 1000;
  return artistAccessToken;
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
    }

    else if (type === "lyricsVideo") {
      if (!YOUTUBE_API_KEY) {
        console.error("Missing YouTube API key.");
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!songName || !artistName) {
        return res.status(400).json({ error: "Missing song name or artist name" });
      }

      try {
        const query = `${decodedArtistName} ${decodedSongName} lyrics video`;
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`;

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch YouTube video");

        const data = await response.json();
        if (!data.items || data.items.length === 0) {
          return res.status(404).json({ error: "No lyrics video found for this song" });
        }

        const videoId = data.items[0].id.videoId;
        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json({ videoId });
      } catch (err) {
        console.error("YouTube API Error:", err);
        return res.status(500).json({ error: "Failed to fetch YouTube lyrics video" });
      }
    }

    else if (type === "lyrics") {
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

    else if (type === "relatedTracks") {
      const LAST_FM_API_KEY = "c98799d0a98242258436e85147bc27fd";

      if (!LAST_FM_API_KEY) {
        console.error("Missing Last.fm API key.");
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!artistName || !songName) {
        return res.status(400).json({ error: "Missing artist name or song name" });
      }

      try {
        const apiUrl = `http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(
          decodedArtistName
        )}&track=${encodeURIComponent(decodedSongName)}&api_key=${LAST_FM_API_KEY}&format=json`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch related tracks");
        }

        const data = await response.json();

        if (!data.similartracks?.track?.length) {
          return res.status(404).json({ error: "No related tracks found" });
        }

        // Fetch album images for each related track using Last.fm's track.getInfo API
        const relatedTracks = await Promise.all(
          data.similartracks.track.map(async (track) => {
            const trackInfoUrl = `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&artist=${encodeURIComponent(
              track.artist.name
            )}&track=${encodeURIComponent(track.name)}&api_key=${LAST_FM_API_KEY}&format=json`;

            try {
              const trackInfoResponse = await fetch(trackInfoUrl);
              const trackInfoData = await trackInfoResponse.json();

              const albumImage =
                trackInfoData.track?.album?.image?.find((img) => img.size === "large")?.["#text"] || null;

              return {
                name: track.name,
                artist: track.artist.name,
                url: track.url,
                image: albumImage || "/placeholder.jpg", // Use album image or fallback to placeholder
              };
            } catch (err) {
              console.error(`Failed to fetch album image for ${track.name}:`, err);
              return {
                name: track.name,
                artist: track.artist.name,
                url: track.url,
                image: "/placeholder.jpg", // Fallback to placeholder if fetching fails
              };
            }
          })
        );

        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json(relatedTracks);
      } catch (err) {
        console.error("Last.fm API Error:", err);
        return res.status(500).json({ error: "Failed to fetch related tracks" });
      }
    }

    // Artist details endpoints 
    else if (type === "artistDetails") {
      if (!artistName) {
        return res.status(400).json({ error: "Missing artist name" });
      }

      try {
        const accessToken = await getArtistAccessToken();
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
    else if (type === "relatedArtists") {
      const LAST_FM_API_KEY = "c98799d0a98242258436e85147bc27fd";
    
      if (!LAST_FM_API_KEY) {
        console.error("Missing Last.fm API key.");
        return res.status(500).json({ error: "Internal server error" });
      }
    
      if (!artistName) {
        return res.status(400).json({ error: "Missing artist name" });
      }
    
      try {
        // Fetch related artists from Last.fm
        const lastFmApiUrl = `http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(
          decodedArtistName
        )}&api_key=${LAST_FM_API_KEY}&format=json`;
    
        const lastFmResponse = await fetch(lastFmApiUrl);
    
        if (!lastFmResponse.ok) {
          throw new Error("Failed to fetch related artists from Last.fm");
        }
    
        const lastFmData = await lastFmResponse.json();
    
        if (!lastFmData.similarartists?.artist?.length) {
          return res.status(404).json({ error: "No related artists found" });
        }
    
        const relatedArtistNames = lastFmData.similarartists.artist.map((artist) => artist.name);
    
        // Fetch artist images from Spotify
        const accessToken = await getArtistAccessToken();
        const relatedArtists = await Promise.all(
          relatedArtistNames.map(async (name) => {
            try {
              const spotifyApiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                name
              )}&type=artist&limit=1`;
    
              const spotifyResponse = await fetch(spotifyApiUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
    
              if (!spotifyResponse.ok) {
                throw new Error(`Failed to fetch artist details for ${name}`);
              }
    
              const spotifyData = await spotifyResponse.json();
              const artist = spotifyData.artists?.items?.[0];
    
              return {
                name: name,
                image: artist?.images?.[0]?.url || "/placeholder.jpg",
                url: artist?.external_urls?.spotify || null,
              };
            } catch (err) {
              console.error(`Spotify API Error for artist ${name}:`, err);
              return {
                name: name,
                image: "/placeholder.jpg",
                url: null,
              };
            }
          })
        );
    
        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json(relatedArtists);
      } catch (err) {
        console.error("API Error:", err);
        return res.status(500).json({ error: "Failed to fetch related artists" });
      }
    }
    else if (type === "artistAlbums") {
      if (!artistName) {
        return res.status(400).json({ error: "Missing artist name" });
      }
    
      try {
        // Get Spotify access token
        const accessToken = await getArtistAccessToken();
    
        // Search for the artist to get their Spotify ID
        const searchApiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          decodedArtistName
        )}&type=artist&limit=1`;
    
        const searchResponse = await fetch(searchApiUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
    
        if (!searchResponse.ok) {
          throw new Error("Failed to fetch artist details from Spotify");
        }
    
        const searchData = await searchResponse.json();
        const artist = searchData.artists?.items?.[0];
    
        if (!artist) {
          return res.status(404).json({ error: "Artist not found" });
        }
    
        const artistId = artist.id;
    
        // Fetch the artist's albums
        const albumsApiUrl = `https://api.spotify.com/v1/artists/${artistId}/albums?limit=10&include_groups=album`;
    
        const albumsResponse = await fetch(albumsApiUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
    
        if (!albumsResponse.ok) {
          throw new Error("Failed to fetch artist albums from Spotify");
        }
    
        const albumsData = await albumsResponse.json();
    
        if (!albumsData.items?.length) {
          return res.status(404).json({ error: "No albums found for this artist" });
        }
    
        // Format the album data
        const albums = albumsData.items.map((album) => ({
          name: album.name,
          releaseDate: album.release_date,
          totalTracks: album.total_tracks,
          image: album.images?.[0]?.url || "/placeholder.jpg",
          url: album.external_urls.spotify,
        }));
    
        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json(albums);
      } catch (err) {
        console.error("Spotify API Error:", err);
        return res.status(500).json({ error: "Failed to fetch artist albums" });
      }
    }
    else if (type === "albumDetails") {
      if (!artistName || !albumName) {
        return res.status(400).json({ error: "Missing artist name or album name" });
      }
    
      try {
        // Get Spotify access token
        const accessToken = await getArtistAccessToken();
    
        // Search for the album to get its Spotify ID
        const searchApiUrl = `https://api.spotify.com/v1/search?q=album:${encodeURIComponent(
          decodedAlbumName
        )}+artist:${encodeURIComponent(decodedArtistName)}&type=album&limit=1`;
    
        const searchResponse = await fetch(searchApiUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
    
        if (!searchResponse.ok) {
          throw new Error("Failed to fetch album details from Spotify");
        }
    
        const searchData = await searchResponse.json();
        const album = searchData.albums?.items?.[0];
    
        if (!album) {
          return res.status(404).json({ error: "Album not found" });
        }
    
        const albumId = album.id;
    
        // Fetch album details
        const albumApiUrl = `https://api.spotify.com/v1/albums/${albumId}`;
        const albumResponse = await fetch(albumApiUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
    
        if (!albumResponse.ok) {
          throw new Error("Failed to fetch album details from Spotify");
        }
    
        const albumData = await albumResponse.json();
    
        // Format the album data
        const formattedAlbum = {
          name: albumData.name,
          releaseDate: albumData.release_date,
          totalTracks: albumData.total_tracks,
          image: albumData.images?.[0]?.url || "/placeholder.jpg",
          tracks: albumData.tracks.items.map((track) => ({
            name: track.name,
            duration: track.duration_ms,
          })),
        };
    
        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json(formattedAlbum);
      } catch (err) {
        console.error("Spotify API Error:", err);
        return res.status(500).json({ error: "Failed to fetch album details" });
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