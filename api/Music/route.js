const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const ARTIST_CLIENT_ID = process.env.ARTIST_CLIENT_ID;
const ARTIST_CLIENT_SECRET = process.env.ARTIST_CLIENT_SECRET;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_KEY2 = process.env.YOUTUBE_API_KEY2;
const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY;
const LAST_FM_API_KEY2 = process.env.LAST_FM_API_KEY2;
let spotifyAccessToken = null;
let spotifyTokenExpiresAt = 0;
let artistAccessToken = null;
import axios from "axios";

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

async function fetchWithSpotifyTokens(url, getToken1, getToken2) {
  // Try with first token
  let token = await getToken1();
  let response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  // If 429, try with second token
  if (response.status === 429 && getToken2) {
    token = await getToken2();
    response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  }

  // If still 429, wait and retry ONCE
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get("Retry-After") || "1", 10);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  }

  return response;
}

async function fetchWithLastFmKeys(url, getKey1, getKey2) {
  // Try with first API key
  let apiKey = await getKey1();
  let urlWithKey = new URL(url);
  urlWithKey.searchParams.set('api_key', apiKey);
  urlWithKey.searchParams.set('format', 'json'); // Last.fm usually requires this

  let response = await fetch(urlWithKey.toString());
  let data = await response.json();

  // If rate limited (HTTP 429 or Last.fm specific error code 29)
  if ((response.status === 429 || data.error === 29) && getKey2) {
    apiKey = await getKey2();
    urlWithKey.searchParams.set('api_key', apiKey);

    response = await fetch(urlWithKey.toString());
    data = await response.json();
  }

  // Retry ONCE if still rate-limited
  if (response.status === 429 || data.error === 29) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));

    response = await fetch(urlWithKey.toString());
    data = await response.json();
  }

  return { response, data };
}
async function fetchWithYouTubeAPI(url, getKey1, getKey2) {
  // Try with first API key
  let apiKey = await getKey1();
  let urlWithKey = new URL(url);
  urlWithKey.searchParams.set('key', apiKey);
  let response = await fetch(urlWithKey.toString());
  let data = await response.json();
  // If rate limited (HTTP 429)
  if (response.status === 429 && getKey2) {
    apiKey = await getKey2();
    urlWithKey.searchParams.set('key', apiKey);

    response = await fetch(urlWithKey.toString());
    data = await response.json();
  }
  // Retry ONCE if still rate-limited
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));

    response = await fetch(urlWithKey.toString());
    data = await response.json();
  }
  return { response, data };

}

export default async function handler(req, res) {
  try {
    const { type, artistName, songName, artistId, albumId, playlistId, playlistType } = req.query;

    if (!type) {
      return res.status(400).json({ error: "Missing type parameter (spotify or youtube)" });
    }

    // Decode before using
    const decodedArtistName = decodeURIComponent(artistName || "");
    const decodedSongName = decodeURIComponent(songName || "");

    if (type === "search") {
      const query = req.query.query;
      const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist,track,album&limit=5`;
      const response = await fetchWithSpotifyTokens(
        apiUrl,
        getSpotifyAccessToken,
        getArtistAccessToken
      );

      const json = await response.json();
      return res.status(200).json(json);
    }


    // Example usage in songDetails:
    else if (type === "songDetails") {
      if (!artistName || !songName) {
        return res.status(400).json({ error: "Missing artist name or song name" });
      }

      try {
        const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          `${decodedArtistName} ${decodedSongName}`
        )}&type=track&limit=1`;

        const response = await fetchWithSpotifyTokens(
          apiUrl,
          getSpotifyAccessToken,
          getArtistAccessToken
        );

        if (!response.ok) {
          throw new Error("Failed to fetch song details");
        }

        const data = await response.json();
        if (!data.tracks?.items?.length) {
          return res.status(404).json({ error: "Song not found" });
        }

        const track = data.tracks.items[0];

        // Prepare the data to cache
        const cachedData = {
          name: track.name,
          artists: track.artists.map((artist) => ({ name: artist.name })),
          album: {
            name: track.album.name,
            images: track.album.images,
            release_date: track.album.release_date,
            type: track.album.album_type,
          },
          preview_url: track.preview_url,
          duration_ms: track.duration_ms,
        };

        // Upload cached data to GitHub
        try {
          const cacheForm = new FormData();
          const cacheBlob = new Blob([JSON.stringify(cachedData, null, 2)], { type: "application/json" });
          const fileName = `${decodedArtistName}_${decodedSongName}.json`.replace(/\s+/g, "_");

          cacheForm.append("file", cacheBlob, fileName);
          cacheForm.append("fileName", fileName);

          await fetch(`/api/uploadFile?type=cachedResponse`, {
            method: "POST",
            body: cacheForm,
          });
        } catch (cacheErr) {
          console.error("Failed to cache song details:", cacheErr);
        }
        res.setHeader('Cache-Control', 'max-age=31536000, immutable');
        return res.status(200).json({
          name: track.name,
          artists: track.artists.map((artist) => ({ name: artist.name })),
          album: {
            name: track.album.name,
            images: track.album.images,
            release_date: track.album.release_date,
            type: track.album.album_type,
          },
          preview_url: track.preview_url,
          duration_ms: track.duration_ms,
        });
      } catch (err) {
        console.error("Spotify API Error:", err);
        return res.status(500).json({ error: "Failed to fetch song details" });
      }
    }
    else if (type === "clientId") {
      res.status(200).json({ clientId: process.env.GOOGLE_CLIENT_ID });
    }
    else if (type === "youtubeMusicVideo") {

      if (!songName || !artistName) {
        return res.status(400).json({ error: "Missing song name or artist name" });
      }

      try {
        const query = `${decodedArtistName} ${decodedSongName} official music video`;
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1`;

        const { response, data } = await fetchWithYouTubeAPI(apiUrl, () => YOUTUBE_API_KEY, () => YOUTUBE_API_KEY2);

        if (!response.ok) throw new Error("Failed to fetch YouTube video");

        // data is already parsed, no need to call response.json()
        console.log(data);

        if (!data.items || data.items.length === 0) {
          return res.status(404).json({ error: "No video found for this song" });
        }

        const videoId = data.items[0].id.videoId;
        res.setHeader('Cache-Control', 'max-age=31536000, immutable');
        return res.status(200).json({ videoId });
      } catch (err) {
        console.error("YouTube API Error:", err);
        return res.status(500).json({ error: "Failed to fetch YouTube video" });
      }
    }

    else if (type === "lyricsVideo") {
      if (!songName || !artistName) {
        return res.status(400).json({ error: "Missing song name or artist name" });
      }

      try {
        const query = `${decodedArtistName} ${decodedSongName} lyrics video`;
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1`;

        const { response, data } = await fetchWithYouTubeAPI(apiUrl, () => YOUTUBE_API_KEY, () => YOUTUBE_API_KEY2);

        if (!response.ok) throw new Error("Failed to fetch YouTube video");

        // data is already parsed, no need to call response.json()
        console.log(data);
        if (!data.items || data.items.length === 0) {
          return res.status(404).json({ error: "No lyrics video found for this song" });
        }

        const videoId = data.items[0].id.videoId;
        res.setHeader('Cache-Control', 'max-age=31536000, immutable');
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

        res.setHeader('Cache-Control', 'max-age=31536000, immutable');
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

        const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          decodedArtistName
        )}&type=track&limit=30`;

        const response = await fetchWithSpotifyTokens(
          apiUrl,
          getSpotifyAccessToken,
          getArtistAccessToken
        );

        if (!response.ok) {
          throw new Error("Failed to fetch artist's songs");
        }

        const data = await response.json();
        if (!data.tracks?.items?.length) {
          return res.status(404).json({ error: "No songs found for this artist" });
        }

        res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
        return res.status(200).json(data.tracks.items);
      } catch (err) {
        console.error("Spotify API Error:", err);
        return res.status(500).json({ error: "Failed to fetch artist's songs" });
      }
    }

    else if (type === "relatedTracks") {

      if (!artistName || !songName) {
        return res.status(400).json({ error: "Missing artist name or song name" });
      }

      try {
        const apiUrl = `http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(
          decodedArtistName
        )}&track=${encodeURIComponent(decodedSongName)}&limit=15`;

        const { response, data } = await fetchWithLastFmKeys(
          apiUrl,
          () => LAST_FM_API_KEY,
          () => LAST_FM_API_KEY2
        );


        if (!response.ok) {
          throw new Error("Failed to fetch related tracks");
        }



        let tracks = data.similartracks?.track;
        if (!tracks) {
          return res.status(404).json({ error: "No related tracks found" });
        }
        // Normalize to array if only one track is returned as an object
        if (!Array.isArray(tracks)) {
          tracks = [tracks];
        }
        if (!tracks.length) {
          return res.status(404).json({ error: "No related tracks found" });
        }

        // Fetch album images for each related track using Last.fm's track.getInfo API
        const relatedTracks = await Promise.all(
          tracks.map(async (track) => {
            const trackInfoUrl = `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&artist=${encodeURIComponent(
              track.artist.name
            )}&track=${encodeURIComponent(track.name)}`;

            try {
              const trackInfoResponse = await fetchWithLastFmKeys(
                trackInfoUrl,
                () => LAST_FM_API_KEY,
                () => LAST_FM_API_KEY2
              );

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

        res.setHeader("Cache-Control", "s-maxage=2419200, stale-while-revalidate");
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
        const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          decodedArtistName
        )}&type=artist&limit=1`;

        const response = await fetchWithSpotifyTokens(
          apiUrl,
          getSpotifyAccessToken,
          getArtistAccessToken
        );

        if (!response.ok) {
          ``
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
          id: artist.id,
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

      if (!artistName) {
        return res.status(400).json({ error: "Missing artist name" });
      }

      try {
        // Fetch related artists from Last.fm
        const lastFmApiUrl = `http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(
          decodedArtistName
        )}&limit=10`;

        const lastFmResponse = await fetchWithLastFmKeys(
          lastFmApiUrl,
          () => LAST_FM_API_KEY,
          () => LAST_FM_API_KEY2
        );

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

        res.setHeader("Cache-Control", "s-maxage=2419200, stale-while-revalidate");
        return res.status(200).json(relatedArtists);
      } catch (err) {
        console.error("API Error:", err);
        return res.status(500).json({ error: "Failed to fetch related artists" });
      }
    }
    else if (type === "artistAlbums") {
      if (!artistId) {
        return res.status(400).json({ error: "Missing artist Id" });
      }

      try {

        // Fetch artist albums
        const apiUrl = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single,appears_on&market=US&limit=15`;
        const albumsResponse = await fetchWithSpotifyTokens(
          apiUrl,
          getSpotifyAccessToken,
          getArtistAccessToken
        );
        if (!albumsResponse.ok) {
          throw new Error("Failed to fetch artist albums from Spotify");
        }
        const albumsData = await albumsResponse.json();
        if (!albumsData.items?.length) {
          return res.status(404).json({ error: "No albums found for this artist" });
        }

        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json(albumsData.items.map((album) => ({
          name: album.name,
          artists: album.artists.map((artist) => ({
            name: artist.name,
            id: artist.id,
            external_urls: artist.external_urls,
          })),
          releaseDate: album.release_date,
          totalTracks: album.total_tracks,
          image: album.images?.[0]?.url || "/placeholder.jpg",
          id: album.id,
        })));
      } catch (err) {
        console.error("Spotify API Error:", err);
        return res.status(500).json({ error: "Failed to fetch artist albums" });
      }
    }

    else if (type === "albumDetail") {
      if (!albumId) {
        return res.status(400).json({ error: "Missing Album Id" });
      }

      try {
        const apiUrl = `https://api.spotify.com/v1/albums/${albumId}`;
        const albumResponse = await fetchWithSpotifyTokens(
          apiUrl,
          getSpotifyAccessToken,
          getArtistAccessToken
        );
        if (!albumResponse.ok) {
          const errorDetails = await albumResponse.text();
          throw new Error(`Spotify Error: ${errorDetails}`);
        }

        const albumData = await albumResponse.json();

        // Build tracks and trackArtists arrays
        const tracks = albumData.tracks.items.map((track) => ({
          name: track.name,
          duration: track.duration_ms,
          artists: track.artists.map((artist) => ({
            name: artist.name,
            id: artist.id,
            external_urls: artist.external_urls,
          })),
        }));

        const formattedAlbum = {
          name: albumData.name,
          releaseDate: albumData.release_date,
          totalTracks: albumData.total_tracks,
          image: albumData.images?.[0]?.url || "/placeholder.jpg",
          id: albumData.id,
          artists: albumData.artists.map((artist) => ({
            name: artist.name,
            id: artist.id,
            external_urls: artist.external_urls,
          })),
          tracks: tracks,
        };

        res.setHeader("Cache-Control", "max-age=31536000, immutable");
        return res.status(200).json(formattedAlbum);
      } catch (err) {
        console.error("Spotify API Error:", err);
        return res.status(500).json({ error: "Failed to fetch album details" });
      }
    }

    else if (type === "topSongs") {
      try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks`;

        const { data } = await fetchWithLastFmKeys(
          url,
          () => LAST_FM_API_KEY,
          () => LAST_FM_API_KEY2
        );
        ;

        const accessToken = await getArtistAccessToken();

        const chartItems = await Promise.all(
          data.tracks.track.map(async (track) => {
            const title = track.name;
            const artist = track.artist.name;

            try {
              const spotifyApiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                `${artist} ${title}`
              )}&type=track&limit=1`;

              const spotifyResponse = await fetch(spotifyApiUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });

              if (!spotifyResponse.ok) {
                throw new Error(`Failed to fetch Spotify data for ${title} by ${artist}`);
              }

              const spotifyData = await spotifyResponse.json();
              const image =
                spotifyData.tracks?.items?.[0]?.album?.images?.[0]?.url || "/placeholder.jpg";

              return { title, artist, image };
            } catch (err) {
              console.error(`Spotify API Error for track ${title} by ${artist}:`, err);
              return { title, artist, image: "/placeholder.jpg" };
            }
          })
        );

        res.setHeader("Cache-Control", "s-maxage=432000, stale-while-revalidate");
        return res.status(200).json(chartItems);

      } catch (error) {
        console.error('Error fetching chart data:', error.message);
        return res.status(500).json({ error: 'Failed to fetch top songs' });
      }

    }
    else if (type === "trendingArtists") {

      try {
        // Fetch trending artists from Last.fm
        const apiUrl = `http://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&limit=20`;
        // ...existing code...
        const { response, data } = await fetchWithLastFmKeys(
          apiUrl,
          () => LAST_FM_API_KEY,
          () => LAST_FM_API_KEY2
        );

        if (!data.artists?.artist?.length) {
          return res.status(404).json({ error: "No trending artists found" });
        }

        // Fetch artist images from Spotify
        const accessToken = await getSpotifyAccessToken();
        const trendingArtists = await Promise.all(
          data.artists.artist.map(async (artist) => {
            try {
              const spotifyApiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                artist.name
              )}&type=artist&limit=1`;

              const spotifyResponse = await fetch(spotifyApiUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });

              if (!spotifyResponse.ok) {
                throw new Error(`Failed to fetch Spotify data for artist ${artist.name}`);
              }

              const spotifyData = await spotifyResponse.json();
              const spotifyArtist = spotifyData.artists?.items?.[0];

              return {
                name: artist.name,
                url: artist.url,
                img: spotifyArtist?.images?.[0]?.url || "/placeholder.jpg",
              };
            } catch (err) {
              console.error(`Spotify API Error for artist ${artist.name}:`, err);
              return {
                name: artist.name,
                url: artist.url,
                img: "/placeholder.jpg",
              };
            }
          })
        );

        res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
        return res.status(200).json(trendingArtists);
      } catch (err) {
        console.error("Last.fm API Error:", err);
        return res.status(500).json({ error: "Failed to fetch trending artists" });
      }
    }



    else if (type === "playlist") {
      if (!playlistId) {
        return res.status(400).json({ error: "Missing playlist ID" });
      }
      if (!playlistType) {
        return res.status(400).json({ error: "Missing playlist type" });
      }
      if (playlistType !== "sp" && playlistType !== "dz") {
        return res.status(400).json({ error: "Invalid playlist type" });
      }

      if (playlistType === "sp") {
        const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;
        const response = await fetchWithSpotifyTokens(
          apiUrl,
          getSpotifyAccessToken,
          getArtistAccessToken
        );

        if (!response.ok) {
          return res.status(500).json({ error: "Failed to fetch Spotify playlist details" });
        }

        const data = await response.json();
        if (!data.tracks?.items?.length) {
          return res.status(404).json({ error: "No tracks found in this playlist" });
        }

        const playlistDetails = {
          name: data.name,
          image: data.images[0]?.url || "/placeholder.jpg",
        };

        const tracks = data.tracks.items.map((item) => ({
          id: item.track.id,
          title: item.track.name,
          artist: { name: item.track.artists[0]?.name || "Unknown Artist" },
          album: { cover_medium: item.track.album.images[0]?.url || "/placeholder.jpg" },
        }));

        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
        return res.status(200).json({ playlistDetails, tracks });
      }

      if (playlistType === "dz") {
        const options = {
          method: "GET",
          url: `https://deezerdevs-deezer.p.rapidapi.com/playlist/${encodeURIComponent(
            playlistId
          )}`,
          headers: {
            "x-rapidapi-key": "67685ec1f0msh5feaa6bf64dbeadp16ffa5jsnd72b2a894302",
            "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
          },
        };

        try {
          const response = await axios.request(options);
          const data = response.data;

          const playlistDetails = {
            name: data.title,
            image: data.picture_medium,
          };

          const tracks = data.tracks.data.map((track) => ({
            id: track.id,
            title: track.title,
            artist: { name: track.artist.name },
            album: { cover_medium: track.album.cover_medium },
          }));

          res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
          return res.status(200).json({ playlistDetails, tracks });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "Failed to fetch Deezer playlist details" });
        }
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