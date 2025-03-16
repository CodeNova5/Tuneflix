'use client';
import { useState } from 'react';

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/uploadImage', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Upload successful!');
      } else {
        setMessage(`Upload failed: ${data.message}`);
      }
    } catch (error) {
      setMessage('Error uploading file.');
    }

    setUploading(false);
  };

  return (
    <div className="upload-container">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={uploadImage} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
