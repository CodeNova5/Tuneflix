import axios from "axios";

export default async function handler(req, res) {
  const { artistName, songName } = req.query;

  if (!artistName || !songName) {
    return res.status(400).json({ error: "Missing artist name or song name in the request." });
  }

  try {
    // Replace this with your lyrics API endpoint
    const response = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artistName)}/${encodeURIComponent(songName)}`
    );

    if (response.data && response.data.lyrics) {
      return res.status(200).json({ lyrics: response.data.lyrics });
    } else {
      return res.status(404).json({ error: "Lyrics not found." });
    }
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return res.status(500).json({ error: "Failed to fetch lyrics." });
  }
}