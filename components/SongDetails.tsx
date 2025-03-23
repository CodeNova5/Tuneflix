'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type SongDetailsType = {
  name: string;
  album: string;
  duration: number;
  relatedTracks: string[];
};

const SongDetails = () => {
  const router = useRouter();
  const [songDetails, setSongDetails] = useState<SongDetailsType | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const fetchSongDetails = async () => {
        const { artist, track } = router.query;
        if (artist && track) {
          const response = await fetch(`/api/song-details?artist=${artist}&track=${track}`);
          const details = await response.json();
          setSongDetails(details);
        }
      };

      fetchSongDetails();
    }
  }, [router.query, isClient]);

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