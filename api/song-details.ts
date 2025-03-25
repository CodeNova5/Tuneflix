import { NextResponse } from "next/response";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const artist = searchParams.get("artist");
    const song = searchParams.get("song");

    if (!artist || !song) {
      return NextResponse.json({ error: "Missing artist or song" }, { status: 400 });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Spotify credentials in environment variables.");
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // Get Spotify access token
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Failed to get Spotify access token:", errorData);
      return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch song details
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}%20${encodeURIComponent(song)}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error("Failed to fetch song details:", errorData);
      return NextResponse.json({ error: "Failed to fetch song details" }, { status: 500 });
    }

    const searchData = await searchResponse.json();

    if (!searchData.tracks || !searchData.tracks.items.length) {
      console.error("No song found for:", artist, song);
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    return NextResponse.json(searchData.tracks.items[0]);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}