'use client';
import { useState } from 'react';

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Upload function
  const uploadImage = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    setUploading(true);
    setMessage('');

    // Convert the file to Base64
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64String = reader.result.split(',')[1]; // Remove data prefix

      try {
        const response = await fetch('/api/comments/uploadFile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: selectedFile.name,
            fileContent: base64String,
          }),
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

    reader.onerror = () => {
      setMessage('Error reading file.');
      setUploading(false);
    };
  };

  return (
    <div className="upload-container">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={uploadImage} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <p>{message}</p>}

      <style jsx>{`
        .upload-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 300px;
        }
        button {
          background-color: #0070f3;
          color: white;
          padding: 10px;
          border: none;
          cursor: pointer;
        }
        button:disabled {
          background-color: #ccc;
        }
      `}</style>
    </div>
  );
}
