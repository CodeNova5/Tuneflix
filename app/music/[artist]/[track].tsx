// filepath: c:\Users\HP i7\Documents\Next\my-next-app\pages\music\[artist]\[track].tsx
import Head from 'next/head';
import SongDetails from '../../../components/SongDetails';

const MusicPage = () => {
  return (
    <div>
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </Head>
      <SongDetails />
    </div>
  );
};

export default MusicPage;