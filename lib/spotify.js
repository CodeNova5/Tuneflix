// filepath: c:\Users\HP i7\Documents\Next\my-next-app\lib\spotify.js
import fetch from 'node-fetch';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

export async function getSongDetails(artist, track) {
  const token = await getAccessToken();
  const response = await fetch(`https://api.spotify.com/v1/search?q=artist:${artist}%20track:${track}&type=track`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (data.tracks.items.length > 0) {
    const song = data.tracks.items[0];
    return {
      name: song.name,
      album: song.album.name,
      duration: song.duration_ms,
      relatedTracks: song.artists.map(artist => artist.name),
    };
  } else {
    return null;
  }
}