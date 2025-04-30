"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link"; // Import Link from next/link

interface ChartItem {
  title: string;
  artist: string;
  image: string;
}

const countrySongs = [
  {
    id: 1,
    link: "/music/playlist/4096400722",
    image: "k-pop.jpg",
    title: "K-Pop",
    text: "Dive into the vibrant world of Korean Pop with our playlist.",
  },
  {
    id: 2,
    link: "/music/playlist/1440614715",
    image: "afro.jpg",
    title: "Afro",
    text: "Experience the best of Afrobeat and Nigerian music.",
  },
  {
    id: 3,
    link: "/music/playlist/1420459465",
    image: "french.jpg",
    title: "French",
    text: "Explore the best of French music with our curated playlist.",
  },
  {
    id: 4,
    link: "/music/playlist/6049895724",
    image: "j-pop.jpg",
    title: "J-Pop",
    text: "Discover the latest hits from Japan's pop music scene.",
  },
  {
    id: 5,
    link: "/music/playlist/1183242961",
    image: "funk.jpg",
    title: "Brazilian Funk",
    text: "Get ready to dance with the hottest Brazilian funk tracks.",
  },
  {
    id: 6,
    link: "/music/playlist/178699142",
    image: "latin.jpg",
    title: "Latin",
    text: "Feel the heat with our selection of Latin hits.",
  }
];

const genre = [
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
    link: "/music/playlist/1999466402",
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
    link: "/music/playlist/10434450042",
    image: "female_rap.jpg",
    title: "Female Rap",
    text: "Watch women take over the rap industry with these hits",
  },
  {
    id: 3,
    link: "/music/playlist/1370794195",
    image: "rock.jpg",
    title: "Rock",
    text: "Explore the best rock tracks from the past and present.",
  },
  {
    id: 3,
    link: "/music/playlist/10973071682",
    image: "folk.jpg",
    title: "Folk & Acoustic",
    text: "Enjoy the soothing sounds of folk and acoustic music.",
  },
  {
    id: 3,
    link: "/music/playlist/1477723445",
    image: "indie.jpg",
    title: "Indie love",
    text: "Discover the best indie tracks for your next love story.",
  },
  {
    id: 3,
    link: "/music/playlist/1950386602",
    image: "soul.jpg",
    title: "Soul",
    text: "Experience the depth of soul music with our curated playlist.",
  },
  {
    id: 3,
    link: "/music/playlist/1615514485",
    image: "jazz.jpg",
    title: "Jazz",
    text: "Relax with the smooth sounds of jazz.",
  }, {
    id: 3,
    link: "/music/playlist/1132251583",
    image: "country.jpg",
    title: "Country",
    text: "Stay in the loop with all the hottest new country music.",
  },
  {
    id: 3,
    link: "/music/playlist/1388965575",
    image: "metal.jpg",
    title: "Metal",
    text: "Explore the best metal tracks from the past and present.",
  }
];

const mood = [
  {
    id: 1,
    link: "/music/playlist/1479458365",
    image: "happy.jpg",
    title: "Happy",
    text: "Feel the joy with our happy playlist.",
  },
  {
    id: 2,
    link: "/music/playlist/1910358422",
    image: "sad.jpg",
    title: "Sad",
    text: "Embrace the emotions with our sad playlist.",
  },
  {
    id: 3,
    link: "/music/playlist/1976454162",
    image: "chill.jpg",
    title: "Chill",
    text: "Relax and unwind with our chill playlist.",
  },
  {
    id: 4,
    link: "/music/playlist/11081408402",
    image: "self-love.jpg",
    title: "Self-love",
    text: "Embrace yourself with our badass self-love playlist (IDGAF).",

  },
  {
    id: 5,
    link: "/music/playlist/5163340024",
    image: "romantic.jpg",
    title: "Romantic",
    text: "Set the mood with our romantic playlist.",
  },
  {
    id: 6,
    link: "/music/playlist/2097558104",
    image: "party.jpg",
    title: "Party",
    text: "Get the party started with our upbeat playlist.",
  },
  {
    id: 7,
    link: "/music/playlist/2153050122",
    image: "workout.jpg",
    title: "Workout",
    text: "Stay motivated with our workout playlist.",
  },
  {
    id: 8,
    link: "/music/playlist/1306085715",
    image: "focus.jpg",
    title: "Focus",
    text: "Concentrate better with our focus playlist.",
  },
  {
    id: 9,
    link: "/music/playlist/733113466",
    image: "sleep.jpg",
    title: "Sleep",
    text: "Drift off to sleep with our calming playlist.",
  },
  {
    id: 10,
    link: "/music/playlist/10746894082",
    image: "gaming.jpg",
    title: "Gaming",
    text: "Get in the zone with our Phonk gaming playlist.",
     }


];

const animeVerse = [
   {
    id: 1,
    link: "/music/playlist/10165025962",
    image: "aot.jpg",
    title: "Attack on Titan",
    text: "Experience the epic soundtrack of Attack on Titan.",
  },
  {
    id: 2,
    link: "/music/playlist/6595233144",
    image: "studio-ghilbli.jpg",
    title: "Studio Ghibli",
    text: "Immerse yourself in the magical world of Studio Ghibli.",
  },
  {
    id: 3,
    link: "/music/playlist/10161850462",
    image: "naruto.jpg",
    title: "Naruto",
    text: "Feel the nostalgia with Naruto's iconic soundtrack.",
  },
  {
    id: 4,
    link: "/music/playlist/8582178942",
    image: "demon-slayer.jpg",
    title: "Demon Slayer",
    text: "Dive into the world of Demon Slayer with its stunning soundtrack.",


  },
  {
    id: 5,
    link: "/music/playlist/12640810163",
    image: "one-piece.jpg",
    title: "One Piece",
    text: "Set sail with the adventurous soundtrack of One Piece.",

  },
  {
    id: 6,
    link: "/music/playlist/10707145982",
    image: "bleach.jpg",
    title: "Bleach",
    text: "Experience the intense battles with Bleach's soundtrack.",

  },
  {
    id: 7,
    link: "/music/playlist/2153050122",
    image: "workout.jpg",
    title: "Workout",
    text: "Stay motivated with our workout playlist.",
  },
  {
    id: 8,
    link: "/music/playlist/1306085715",
    image: "focus.jpg",
    title: "Focus",
    text: "Concentrate better with our focus playlist.",
  },
  {
    id: 9,
    link: "/music/playlist/733113466",
    image: "sleep.jpg",
    title: "Sleep",
    text: "Drift off to sleep with our calming playlist.",
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

    </div>

  );
}
