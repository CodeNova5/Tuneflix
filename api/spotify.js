export default async function handler(req, res) {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + Buffer.from(
                process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
        },
        body: "grant_type=client_credentials",
    });

    const { access_token } = await tokenRes.json();

    const spotifyRes = await fetch("https://api.spotify.com/v1/browse/new-releases", {
        headers: { Authorization: `Bearer ${access_token}` },
    });

    const data = await spotifyRes.json();
    res.status(200).json(data);
}