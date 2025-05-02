"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link"; // Import Link from next/link

interface ChartItem {
  title: string;
  artist: string;
  image: string;
}

interface Artist {
  name: string;
  img: string;
}

const countrySongs = [
  {
    id: 1,
    link: "/music/playlist/4096400722/type/dz",
    image: "k-pop.jpg",
    title: "K-Pop",
    text: "Dive into the vibrant world of Korean Pop with our playlist.",
  },
  {
    id: 2,
    link: "/music/playlist/1440614715/type/dz",
    image: "afro.jpg",
    title: "Afro",
    text: "Experience the best of Afrobeat and Nigerian music.",
  },
  {
    id: 3,
    link: "/music/playlist/1420459465/type/dz",
    image: "french.jpg",
    title: "French",
    text: "Explore the best of French music with our curated playlist.",
  },
  {
    id: 4,
    link: "/music/playlist/6049895724/type/dz",
    image: "j-pop.jpg",
    title: "J-Pop",
    text: "Discover the latest hits from Japan's pop music scene.",
  },
  {
    id: 5,
    link: "/music/playlist/1183242961/type/dz",
    image: "funk.jpg",
    title: "Brazilian Funk",
    text: "Get ready to dance with the hottest Brazilian funk tracks.",
  },
  {
    id: 6,
    link: "/music/playlist/178699142/type/dz",
    image: "latin.jpg",
    title: "Latin",
    text: "Feel the heat with our selection of Latin hits.",
  }
];

const genre = [
  {
    id: 1,
    link: "/music/playlist/2228601362/type/dz",
    image: "pop.jpg",
    title: "Fresh Pop",
    text: "Discover the best releases with our fresh pop selection.",
  },
  {
    id: 2,
    link: "/music/playlist/706093725/type/dz",
    image: "edm.jpg",
    title: "Dance & EDM",
    text: "Feel the beat with our dance and EDM playlist.",
  },
  {
    id: 3,
    link: "/music/playlist/02okEcUQXHe2sS5ajE9XG0/type/sp",
    image: "hip-hop.jpg",
    title: "Hip-Hop",
    text: "Explore the latest and greatest in hip-hop.",
  },
  {
    id: 3,
    link: "/music/playlist/1999466402/type/dz",
    image: "rnb.jpg",
    title: "R&B",
    text: "Experience the smoothest R&B tracks.",
  },
  {
    id: 3,
    link: "/music/playlist/13754510761/type/dz",
    image: "rap.jpg",
    title: "Rap",
    text: "Dive into the world of rap with our curated playlist.",
  },
  {
    id: 3,
    link: "/music/playlist/10434450042/type/dz",
    image: "female_rap.jpg",
    title: "Female Rap",
    text: "Watch women take over the rap industry with these hits",
  },
  {
    id: 3,
    link: "/music/playlist/1370794195/type/dz",
    image: "rock.jpg",
    title: "Rock",
    text: "Explore the best rock tracks from the past and present.",
  },
  {
    id: 3,
    link: "/music/playlist/10973071682/type/dz",
    image: "folk.jpg",
    title: "Folk & Acoustic",
    text: "Enjoy the soothing sounds of folk and acoustic music.",
  },
  {
    id: 3,
    link: "/music/playlist/1477723445/type/dz",
    image: "indie.jpg",
    title: "Indie love",
    text: "Discover the best indie tracks for your next love story.",
  },
  {
    id: 3,
    link: "/music/playlist/1950386602/type/dz",
    image: "soul.jpg",
    title: "Soul",
    text: "Experience the depth of soul music with our curated playlist.",
  },
  {
    id: 3,
    link: "/music/playlist/1615514485/type/dz",
    image: "jazz.jpg",
    title: "Jazz",
    text: "Relax with the smooth sounds of jazz.",
  }, {
    id: 3,
    link: "/music/playlist/1132251583/type/dz",
    image: "country.jpg",
    title: "Country",
    text: "Stay in the loop with all the hottest new country music.",
  },
  {
    id: 3,
    link: "/music/playlist/1388965575/type/dz",
    image: "metal.jpg",
    title: "Metal",
    text: "Explore the best metal tracks from the past and present.",
  }
];

const mood = [
  {
    id: 1,
    link: "/music/playlist/1479458365/type/dz",
    image: "happy.jpg",
    title: "Happy",
    text: "Feel the joy with our happy playlist.",
  },
  {
    id: 2,
    link: "/music/playlist/1910358422/type/dz",
    image: "sad.jpg",
    title: "Sad",
    text: "Embrace the emotions with our sad playlist.",
  },
  {
    id: 3,
    link: "/music/playlist/1976454162/type/dz",
    image: "chill.jpg",
    title: "Chill",
    text: "Relax and unwind with our chill playlist.",
  },
  {
    id: 4,
    link: "/music/playlist/11081408402/type/dz",
    image: "self-love.jpg",
    title: "Self-love",
    text: "Embrace yourself with our badass self-love playlist (IDGAF).",

  },
  {
    id: 5,
    link: "/music/playlist/4cJ8qUzt5CSTE9XN5uK2z2/type/sp",
    image: "romantic.jpg",
    title: "Romantic",
    text: "Set the mood with our romantic playlist.",
  },
  {
    id: 6,
    link: "/music/playlist/2097558104/type/dz",
    image: "party.jpg",
    title: "Party",
    text: "Get the party started with our upbeat playlist.",
  },
  {
    id: 7,
    link: "/music/playlist/2153050122/type/dz",
    image: "workout.jpg",
    title: "Workout",
    text: "Stay motivated with our workout playlist.",
  },
  {
    id: 8,
    link: "/music/playlist/1306085715/type/dz",
    image: "focus.jpg",
    title: "Focus",
    text: "Concentrate better with our focus playlist.",
  },
  {
    id: 9,
    link: "/music/playlist/733113466/type/dz",
    image: "sleep.jpg",
    title: "Sleep",
    text: "Drift off to sleep with our calming playlist.",
  },
  {
    id: 10,
    link: "/music/playlist/10746894082/type/dz",
    image: "gaming.jpg",
    title: "Gaming",
    text: "Get in the zone with our Phonk gaming playlist.",
  }


];

const animeVerse = [
  {
    id: 1,
    link: "/music/playlist/77fmI8qO4Y0ZXvVyeSr6VY/type/sp",
    image: "aot.jpg",
    title: "Attack on Titan",
    text: "Experience the epic soundtrack of Attack on Titan.",
  },

  {
    id: 3,
    link: "/music/playlist/2Rskw6jbWzyTd4xbtlyJTO/type/sp",
    image: "naruto.jpg",
    title: "Naruto",
    text: "Feel the nostalgia with Naruto's iconic soundtrack.",
  },
  {
    id: 4,
    link: "/music/playlist/4dbyVjvMaCfxY32ORFrKZx/type/sp",
    image: "demon-slayer.jpg",
    title: "Demon Slayer",
    text: "Dive into the world of Demon Slayer with its stunning soundtrack.",
  },

  {
    id: 2,
    link: "/music/playlist/2SfdRdiYrcWXE0RulwgUpL/type/sp",
    image: "frieren.jpg",
    title: "Frieren",
    text: "Immerse yourself in the world of Frieren with its beautiful soundtrack.",
  },
  {
    id: 3,
    link: "/music/playlist/7D0WJQIO0T1FnmqMQhGmyU/type/sp",
    image: "tad.jpg",
    title: "The apothecary diaries",
    text: "Experience the enchanting world of The Apothecary Diaries with its captivating soundtrack.",
  },
  {
    id: 4,
    link: "/music/playlist/13071658123/type/dz",
    image: "dandadan.jpg",
    title: "Dandadan",
    text: "Dive into the world of Dandadan with its captivating soundtrack.",
  },
  {
    id: 5,
    link: "/music/playlist/4CXUvJWg0ubdXC2MsaDM41/type/sp",
    image: "spy-x-family.jpg",
    title: "Spy x Family",
    text: "Experience the blend of action and comedy with Spy x Family's soundtrack.",
  },
  {
    id: 6,
    link: "/music/playlist/12677797501/type/dz",
    image: "kaiju.jpg",
    title: "Kaiju No. 8",
    text: "Immerse yourself in the world of Kaiju No. 8 with its thrilling soundtrack.",
  },
  {
    id: 7,
    link: "/music/playlist/0E6nx38s2K13qDL8YkbQ3F/type/sp",
    image: "black-clover.jpg",
    title: "Black Clover",
    text: "Experience the magic of Black Clover's soundtrack.",
  },
  {
    id: 6,
    link: "/music/playlist/03d3KH6oFkoXk4syLWrk1s/type/sp",
    image: "blue-lock.jpg",
    title: "Blue Lock",
    text: "Feel the adrenaline with Blue Lock's electrifying soundtrack.",
  },
  {
    id: 5,
    link: "/music/playlist/2HhaF1jOyLonX40otTfn4z/type/sp",
    image: "one-piece.jpg",
    title: "One Piece",
    text: "Set sail with the adventurous soundtrack of One Piece.",

  },
  {
    id: 6,
    link: "/music/playlist/2bidxsC3QgXzEIKB6dnTIH/type/sp",
    image: "bleach.jpg",
    title: "Bleach",
    text: "Experience the intense battles with Bleach's soundtrack.",

  },
  {
    id: 7,
    link: "/music/playlist/59QG71ZEdVV7xneRAWJo2b/type/sp",
    image: "hxh.jpg",
    title: "Hunter x Hunter",
    text: "Explore the emotional depth of Hunter x Hunter's soundtrack.",

  },
  {
    id: 8,
    link: "/music/playlist/3OvtlM4CkLIhS9O6NadgQX/type/sp",
    image: "jjk.jpg",
    title: "Jujutsu Kaisen",
    text: "Feel the thrill with Jujutsu Kaisen's electrifying soundtrack.",
  },
  {
    id: 9,
    link: "/music/playlist/28iePdgP3BmHzmGhjZlvrv/type/sp",
    image: "solo.jpg",
    title: "Solo Leveling",
    text: "Experience the epic soundtrack of Solo Leveling.",

  },
  {
    id: 10,
    link: "/music/playlist/7270803764/type/dz",
    image: "tokyo-ghoul.jpg",
    title: "Tokyo Ghoul",
    text: "Immerse yourself in the dark world of Tokyo Ghoul.",
  },

  {
    id: 11,
    link: "/music/playlist/58ti42AIci4jSmAVxwB094/type/sp",
    image: "my-hero.jpg",
    title: "My Hero Academia",
    text: "Feel the heroism with My Hero Academia's soundtrack.",
  },
  {
    id: 12,
    link: "/music/playlist/3BIDgGeHvC0fuVFbF6cMas/type/sp",
    image: "death-note.jpg",
    title: "Death Note",
    text: "Experience the psychological thriller of Death Note.",
  },
  {
    id: 13,
    link: "/music/playlist/5698032902/type/dz",
    image: "sword-art.jpg",
    title: "Sword Art Online",
    text: "Dive into the virtual world of Sword Art Online.",
  },
  {
    id: 14,
    link: "/music/playlist/7iPIDAjUcqqgFGO24WUCua/type/sp",
    image: "fairy-tail.jpg",
    title: "Fairy Tail",
    text: "Experience the magic of Fairy Tail's soundtrack.",
  },
  {
    id: 15,
    link: "/music/playlist/245VxdXB69INCDJfjuSLdJ/type/sp",
    image: "fullmetal.jpg",
    title: "Fullmetal Alchemist",
    text: "Feel the depth of Fullmetal Alchemist's soundtrack.",
  },

  {
    id: 17,
    link: "/music/playlist/3eap0jJLCmA9biDsXnloeV/type/sp",
    image: "dbz.jpg",
    title: "Dragon Ball Z",
    text: "Feel the power with Dragon Ball's iconic soundtrack.",
  },
  {
    id: 18,
    link: "/music/playlist/250TNmyz2qOzd00y0sglrW/type/sp",
    image: "one-punch.jpg",
    title: "One Punch",
    text: "Experience the humor and action of One Punch",
  }



];
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
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Top songs this week</h1>
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
                <h2 className="font-semibold mt-2">{song.title}</h2>
                <p className="text-gray-400">{song.artist}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>


      <div className="overflow-x-auto">
        <h1 className="text-2xl font-bold mb-4">Top Artists</h1>
        <div className="flex space-x-4 p-4">
          {artists.map((artist, idx) => (
            <Link key={idx} href={`/music/${encodeURIComponent(artist.name)}`}>
              <div className="border rounded-lg p-2 shadow-md bg-gray-800 cursor-pointer w-64">
                <img
                  src={artist.img}
                  alt={artist.name}
                  className="w-30 h-30 object-cover rounded-full mb-2"
                />
                <h2 className="font-semibold text-lg">{artist.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>

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

    </div>

  );
}
