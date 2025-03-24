import Link from "next/link";

export async function getServerSideProps() {
    const res = await fetch("/api/spotify");
    const data = await res.json();
    return { props: { albums: data.albums.items } };
}

export default function Home({ albums }) {
    return (
        <div>
            <h1>New Releases</h1>
            {albums.map(album => (
                <div key={album.id}>
                    <Link href={`/artist/${album.artists[0].id}`}>
                        <a>{album.artists[0].name}</a>
                    </Link>
                </div>
            ))}
        </div>
    );
}