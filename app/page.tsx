import FileUpload from '../components/FileUpload';
import CommentSection from "../components/CommentSection";
import Head from 'next/head';
import SongDetails from '../components/SongDetails';


export default function Home() {
  return (
    <div>
<Head>
        <link rel="stylesheet"  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
      </Head>

      <h1>Upload an Image</h1>
      <FileUpload />
      <CommentSection />
      <SongDetails />
    </div>
  );
}
