"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link"; // Import Link from next/link

interface ChartItem {
  title: string;
  artist: string;
  image: string;
}


const items = [
  {
    id: 1,
    link: "/music/playlist/2228601362",
    image: "pop.jpg",
    title: "Fresh Pop",
    text: "Discover the best releases with our fresh pop selection.",
  },
  {
    id: 2,
    link: "/music/playlist/706093725",
    image: "edm.jpg",
    title: "Dance & EDM",
    text: "Feel the beat with our dance and EDM playlist.",
  },
  {
    id: 3,
    link:  "/music/playlist/1999466402",
    image: "rnb.jpg",
    title: "R&B",
    text: "Experience the smoothest R&B tracks.",
  },
  {
    id: 3,
    link: "/music/playlist/1996494362",
    image: "rap.jpg",
    title: "Rap",
    text: "Dive into the world of rap with our curated playlist.",
  },
  {
    id: 3,
    link: "#",
    image: "https://via.placeholder.com/150",
    title: "Item Three",
    text: "This is the description of item three.",
  },
  {
    id: 3,
    link: "#",
    image: "https://via.placeholder.com/150",
    title: "Item Three",
    text: "This is the description of item three.",
  },
];


export default function HomePage() {
  const [songs, setSongs] = useState<ChartItem[]>([]);
  const [error, setError] = useState<string | null>(null);


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

    fetchTopSongs();
  }, []);
  const getFirstArtist = (artist: string): string => {
    return artist.split(/[,&]|feat(?:uring)?|\sX\s|\svs\.?\s/i)[0].trim();
  };



  if (error) {
    return <h1>Error: {error}</h1>;
  }

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Billboard Global 200</h1>
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
                  className="w-full h-48 object-cover rounded"
                />
                <h2 className="font-semibold mt-2">{song.title}</h2>
                <p className="text-gray-400">{song.artist}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>



      <div className="overflow-x-auto">
        <div className="flex space-x-4 p-4">
          {items.map((item) => (
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

    </div>

  );
}
