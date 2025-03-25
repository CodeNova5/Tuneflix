import { NextResponse } from "next/server";

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artist = searchParams.get("artist");
  const song = searchParams.get("song");

  if (!artist || !song) {
    return NextResponse.json({ error: "Missing artist or song" }, { status: 400 });
  }

  try {
    const accessToken = await getSpotifyAccessToken();

    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}%20${encodeURIComponent(song)}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const searchData = await searchResponse.json();
    const track = searchData.tracks.items[0] || null;

    return NextResponse.json(track);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch song details" }, { status: 500 });
  }
}