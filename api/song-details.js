const handler = async (req, res) => {
  try {
    const { artist, song } = req.query;

    // Validate input parameters
    if (!artist || !song) {
      return res.status(400).json({ error: "Missing artist or song" });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Spotify credentials in environment variables.");
      return res.status(500).json({ error: "Internal server error" });
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
      return res.status(500).json({ error: "Failed to get access token" });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch song details
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}%20${encodeURIComponent(song)}&type=track&limit=10`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error("Failed to fetch song details:", errorData);
      return res.status(500).json({ error: "Failed to fetch song details" });
    }

    const searchData = await searchResponse.json();

    if (!searchData.tracks || !searchData.tracks.items.length) {
      console.error("No song found for:", artist, song);
      return res.status(404).json({ error: "Song not found" });
    }

    // Filter tracks to prioritize singles
    const singleTrack = searchData.tracks.items.find(
      (track) => track.album.album_type === "single"
    );

    if (singleTrack) {
      return res.status(200).json(singleTrack);
    }

    // If no single is found, return the first track as a fallback
    return res.status(200).json(searchData.tracks.items[0]);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;