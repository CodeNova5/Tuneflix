import axios from 'axios';
import * as cheerio from "cheerio";

const URL = 'https://www.billboard.com/charts/artist-100/'; // or try 'hot-100'

async function fetchTrendingArtists() {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    const artists = [];

    $('.o-chart-results-list__item .c-title').each((i, el) => {
      const artist = $(el).text().trim();
      if (artist && !artists.includes(artist)) {
        artists.push(artist);
      }
      if (artists.length >= 20) return false; // break loop
    });

    console.log('🎤 Top 20 Trending Artists on Billboard:');
    artists.forEach((artist, i) => {
      console.log(`${i + 1}. ${artist}`);
    });

  } catch (error) {
    console.error('Error fetching artists:', error.message);
  }
}

fetchTrendingArtists();
