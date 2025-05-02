import axios from 'axios';
import * as cheerio from 'cheerio';

const URL = 'https://www.billboard.com/charts/artist-100/';

async function fetchTrendingArtists() {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    const artists = [];

    // Step 1: Extract names first (in order)
    $('.o-chart-results-list__item .c-title').each((i, el) => {
      const name = $(el).text().trim();
      if (name && artists.length < 20 && !artists.find(a => a.name === name)) {
        artists.push({ name }); // placeholder for img
      }
    });

    // Step 2: Extract images in same order and attach by index
    $('li.o-chart-results-list__item img.c-lazy-image__img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && i < artists.length) {
        artists[i].img = src;
      }
    });

    // Output
    console.log('🎤 Top 20 Trending Artists on Billboard:\n');
    artists.forEach((artist, i) => {
      console.log(`${i + 1}. ${artist.name}`);
      console.log(`   🖼️ ${artist.img || 'No image found'}\n`);
    });

  } catch (error) {
    console.error('Error fetching artists:', error.message);
  }
}

fetchTrendingArtists();
