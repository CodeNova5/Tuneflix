import axios from 'axios';
import * as cheerio from 'cheerio';

async function getChart(url, extractor) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const list = [];

    $('.o-chart-results-list-row-container').each((i, el) => {
      const item = extractor($, el);
      if (item) list.push(item);
    });

    return list.slice(0, 20);
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error.message);
    return [];
  }
}

// ✅ Extract song title and artist correctly
function extractSong($, el) {
  const title = $(el).find('h3#title-of-a-story').first().text().trim();
  const artist = $(el).find('span.c-label.a-no-trucate').first().text().trim();
  return `${title} - ${artist}`;
}

// ✅ Extract artist name only
function extractArtist($, el) {
  return $(el).find('h3').first().text().trim();
}

const hot100Url = 'https://www.billboard.com/charts/hot-100/';
const artist100Url = 'https://www.billboard.com/charts/artist-100/';

const run = async () => {
  const songs = await getChart(hot100Url, extractSong);
  const artists = await getChart(artist100Url, extractArtist);

  console.log('\n🎵 Billboard Hot 100 - Top 20 Songs:');
  songs.forEach((s, i) => console.log(`${i + 1}. ${s}`));

  console.log('\n🎤 Billboard Artist 100 - Top 20 Artists:');
  artists.forEach((a, i) => console.log(`${i + 1}. ${a}`));
};

run();
