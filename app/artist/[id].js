import { useRouter } from "next/router";

export default function Artist({ artist }) {
    const router = useRouter();
    if (router.isFallback) return <p>Loading...</p>;

    return (
        <div>
            <h1>{artist.name}</h1>
            <img src={artist.images[0]?.url} alt={artist.name} width={300} />
            <p>Genres: {artist.genres.join(", ")}</p>
        </div>
    );
}

export async function getServerSideProps(context) {
    const { id } = context.params;

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

    const artistRes = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
        headers: { Authorization: `Bearer ${access_token}` },
    });

    const artist = await artistRes.json();

    return { props: { artist } };
}