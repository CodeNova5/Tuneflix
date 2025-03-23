// filepath: c:\Users\HP i7\Documents\Next\my-next-app\components\SongDetails.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSongDetails } from '../lib/spotify';

const SongDetails = () => {
  const router = useRouter();
  const [songDetails, setSongDetails] = useState(null);

  useEffect(() => {
    const fetchSongDetails = async () => {
      const { artist, track } = router.query;
      if (artist && track) {
        const details = await getSongDetails(artist as string, track as string);
        setSongDetails(details);
      }
    };

    fetchSongDetails();
  }, [router.query]);

  if (!songDetails) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Song Details</h2>
      <p>Name: {songDetails.name}</p>
      <p>Album: {songDetails.album}</p>
      <p>Duration: {songDetails.duration} ms</p>
      <p>Related Tracks: {songDetails.relatedTracks.join(', ')}</p>
    </div>
  );
};

export default SongDetails;