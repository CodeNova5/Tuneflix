"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { genre, mood, animeVerse, countrySongs, kids } from "../components/arrays";
import Header from "../components/Header";
import Footer from "../components/Footer";
interface ChartItem {
    title: string;
    artist: string;
    image: string;
}

interface Artist {
    name: string;
    img: string;
}

export default function HomePage() {
    const [songs, setSongs] = useState<ChartItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [artists, setArtists] = useState<Artist[]>([]);


    useEffect(() => {
        async function fetchTopSongs() {
            try {
                const response = await fetch(`/api/Music/route?type=topSongs`);
                if (!response.ok) throw new Error("Failed to fetch top songs");
                const data = await response.json();
                setSongs(data);
            } catch (err: any) {
                console.error(err.message);
                setError(err.message);
            }
        }
        async function fetchTopArtists() {
            try {
                const response = await fetch(`/api/Music/route?type=trendingArtists`);
                if (!response.ok) throw new Error("Failed to fetch top artists");
                const data = await response.json();
                console.log(data);
                setArtists(data.map((artist: { name: string; img: string }) => ({ name: artist.name, img: artist.img })));
            } catch (err: any) {
                console.error(err.message);
                setError(err.message);
            }
        }

        fetchTopArtists();
        fetchTopSongs();
    }, []);
    const getFirstArtist = (artist: string): string => {
        return artist.split(/[,&]|feat(?:uring)?|\sX\s|\svs\.?\s/i)[0].trim();
    };



    if (error) {
        return <h1>Error: {error}</h1>;
    }

    return (
        <div style={{ backgroundColor: "#111" }} className="min-h-screen text-white">
            <Header />
            <h1 className="text-3xl font-bold mb-4">Top songs this week</h1>
            <main>
                <section aria-labelledby="top-songs">
                    <h2 id="top-songs" className="text-2xl font-bold mb-4">Top Songs</h2>
                    <div className="overflow-x-auto">
                        <div className="grid grid-flow-col grid-rows-4 auto-cols-max gap-4 w-max">
                            {songs.map((song, idx) => (
                                <Link
                                    key={idx}
                                    href={`/music/${getFirstArtist(song.artist)}/song/${song.title}`}
                                >
                                    <div className="border rounded-lg p-2 shadow-md bg-gray-800 cursor-pointer w-64">
                                        <img
                                            src={song.image}
                                            alt={song.title}
                                            className="w-full h-30 object-cover rounded"
                                        />
                                        <h3 className="font-semibold mt-2">{song.title}</h3>
                                        <p className="text-gray-400">{song.artist}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section aria-labelledby="top-artists">
                    <h2 id="top-artists" className="text-2xl font-bold mb-4">Top Artists</h2>
                    <div className="overflow-x-auto">
                        <div className="flex space-x-4 p-4">
                            {artists.map((artist, idx) => (
                                <Link key={idx} href={`/music/${encodeURIComponent(artist.name)}`}>
                                    <div className="border rounded-lg p-2 shadow-md bg-gray-800 cursor-pointer w-64">
                                        <img
                                            src={artist.img}
                                            alt={artist.name}
                                            className="w-30 h-30 object-cover rounded-full mb-2"
                                        />
                                        <h3 className="font-semibold text-lg">{artist.name}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <div className="overflow-x-auto">
                <h2 className="text-2xl font-bold mb-4">Genre</h2>
                <div className="flex space-x-4 p-4">
                    {genre.map((item) => (
                        <Link key={item.id} href={item.link}>
                            <div className="border rounded-lg p-2 shadow-md bg-gray-800 cursor-pointer w-64">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-48 object-contain rounded bg-black"
                                />
                                <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
                                <p className="text-sm text-gray-200">{item.text}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">

                <h2 className="text-2xl font-bold mb-4">Mood</h2>
                <div className="flex space-x-4 p-4">
                    {mood.map((item) => (
                        <Link key={item.id} href={item.link}>
                            <div className="border rounded-lg p-2 shadow-md bg-gray-800 cursor-pointer w-64">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-48 object-contain rounded bg-black"
                                />
                                <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
                                <p className="text-sm text-gray-200">{item.text}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <h2 className="text-2xl font-bold mb-4">AnimeVerse</h2>
                <div className="flex space-x-4 p-4">
                    {animeVerse.map((item) => (
                        <Link key={item.id} href={item.link}>
                            <div className="border rounded-lg p-2 shadow-md bg-gray-800 cursor-pointer w-64">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-48 object-contain rounded bg-black"
                                />
                                <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
                                <p className="text-sm text-gray-200">{item.text}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <h2 className="text-2xl font-bold mb-4">Country Songs</h2>
                <div className="flex space-x-4 p-4">
                    {countrySongs.map((item) => (
                        <Link key={item.id} href={item.link}>
                            <div className="border rounded-lg p-2 shadow-md bg-gray-800 cursor-pointer w-64">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-48 object-contain rounded bg-black"
                                />
                                <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
                                <p className="text-sm text-gray-200">{item.text}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <h2 className="text-2xl font-bold mb-4">Kids Songs</h2>
                <div className="flex space-x-4 p-4">
                    {kids.map((item) => (
                        <Link key={item.id} href={item.link}>
                            <div className="border rounded-lg p-2 shadow-md bg-gray-800 cursor-pointer w-64">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-48 object-contain rounded bg-black"
                                />
                                <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
                                <p className="text-sm text-gray-200">{item.text}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
