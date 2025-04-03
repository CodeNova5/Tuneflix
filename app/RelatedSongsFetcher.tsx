"use client";
import React, { useState, useEffect } from 'react';

const API_KEY = 'AIzaSyChyRibzNiTA9LsUTr-iINP7Tpny6psFBM';  // Get from Google Cloud Console
const CSE_ID = 'e6053a3737f2448a9'; // Your Search Engine ID
const song = 'Shape of You';
const artist = 'Ed Sheeran';
const query = `related songs to ${song} by ${artist}`;

const RelatedSongsFetcher: React.FC = () => {
  const [results, setResults] = useState<{ title: string, link: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${CSE_ID}&key=${API_KEY}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.items) {
          setResults(data.items.map((item: any) => ({ title: item.title, link: item.link })));
        } else {
          setResults([]);
          setError('No related songs found.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError('An error occurred while fetching related songs.');
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Related Songs to {song} by {artist}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {results.map((result, index) => (
          <li key={index}>
            <a href={result.link} target="_blank" rel="noopener noreferrer">{result.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedSongsFetcher;