import FileUpload from '../components/FileUpload';
import CommentSection from "../components/CommentSection";


export default function Home() {
  return (
    <div>
      <h1>Upload an Image</h1>
      <FileUpload />
      <CommentSection />
    </div>
  );
}
