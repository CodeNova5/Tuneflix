import fs from 'fs';
import ytdl from 'ytdl-core';

const videoUrl = 'http://www.youtube.com/watch?v=aqz-KE-bpKQ';

if (!ytdl.validateURL(videoUrl)) {
  console.error('Invalid YouTube URL');
  process.exit(1);
}

ytdl(videoUrl)
  .pipe(fs.createWriteStream('video.mp4'))
  .on('finish', () => console.log('Download complete!'))
  .on('error', (err) => console.error('Error:', err.message));