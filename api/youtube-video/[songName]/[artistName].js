const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export default async function handler(req, res) {
  const { songName, artistName } = req.query;

  if (!YOUTUBE_API_KEY) {
    return res.status(500).json({ error: "Missing YouTube API key in environment variables." });
  }

  if (!songName || !artistName) {
    return res.status(400).json({ error: "Missing song name or artist name in the request." });
  }

  try {
    const query = `${songName} ${artistName} official music video`;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch YouTube video:", errorData);
      return res.status(500).json({ error: "Failed to fetch YouTube video." });
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      return res.status(200).json({ videoId });
    } else {
      return res.status(404).json({ error: "No video found for this song." });
    }
  } catch (error) {
    console.error("YouTube API Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}