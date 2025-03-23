// filepath: c:\Users\HP i7\Documents\Next\my-next-app\pages\api\song-details.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSongDetails } from '../../lib/spotify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { artist, track } = req.query;

  if (!artist || !track) {
    return res.status(400).json({ error: 'Missing artist or track' });
  }

  try {
    const details = await getSongDetails(artist as string, track as string);
    if (details) {
      res.status(200).json(details);
    } else {
      res.status(404).json({ error: 'Song not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}