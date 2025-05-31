import React, { useState } from 'react';
import CommentSection from './CommentSection'; // adjust path as needed

const CommentShareModule = ({ track, artist, album, playlist }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

React.useEffect(() => {
  if (isModalOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  // Cleanup in case the component unmounts while modal is open
  return () => {
    document.body.style.overflow = '';
  };
}, [isModalOpen]);

  // Ensure only one of track, artist, album, or playlist is provided
  const inputs = [track, artist, album, playlist].filter(Boolean);
  if (inputs.length === 0) {
    console.error('CommentShareModule requires one of: track, artist, album, or playlist.');
    return null;
  }
  if (inputs.length > 1) {
    console.error('CommentShareModule should accept only one of: track, artist, album, or playlist.');
    return null;
  }

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const shareContent = async () => {
    if (isSharing) return;
    setIsSharing(true);

    const shareData = track
      ? {
          title: `${track.name} by ${track.artists.map((a) => a.name).join(', ')}`,
          text: `Check out this song: ${track.name} by ${track.artists.map((a) => a.name).join(', ')}`,
          image: track.album.images[0]?.url || '',
          url: window.location.href,
        }
      : artist
      ? {
          title: artist.name,
          text: `Check out this artist: ${artist.name}`,
          image: artist.image || '',
          url: window.location.href,
        }
      : album
      ? {
          title: `${album.name} `,
          text: `Check out this album: ${album.name} `,
          image: album.image || '',
          url: window.location.href,
        }
      : playlist
      ? {
          title: playlist.name,
          text: `Check out this playlist: ${playlist.name}`,
          image: playlist.image || '',
          url: window.location.href,
        }
      : null;

    if (shareData) {
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.error('Error sharing:', err);
        }
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    }

    setIsSharing(false);
  };



  return (
    <>
      <div style={styles.container}>
        <h2 style={styles.heading}>Comment and Share</h2>
        <div style={styles.iconRow}>
          <button onClick={toggleModal} aria-label={isModalOpen ? 'Close Comments' : 'Open Comments'} style={styles.iconBtn}>
            <i className="fas fa-comments" style={styles.icon}></i>
          </button>
          <button onClick={shareContent} aria-label="Share Content" style={styles.iconBtn}>
            <i className="fas fa-share-nodes" style={styles.icon}></i>
          </button>
        </div>
        <div style={styles.labels}>
          <span style={styles.labelText}>Comment</span>
          <span style={styles.labelText}>Share</span>
        </div>
      </div>

      { /* The modal overlay is always rendered, but hidden unless isModalOpen is true */ }
<div
  style={{
    ...styles.modal,
    display: isModalOpen ? 'block' : 'none'
  }}
>
  <div style={styles.modalHeader}>
    <h2>Comments</h2>
    <button onClick={toggleModal} style={styles.closeBtn}>✖</button>
  </div>
  <div style={styles.modalContent}>
    <CommentSection />
  </div>
</div>
    </>
  );
};

export default CommentShareModule;

const styles = {
  container: {
    marginTop: '20px',
    textAlign: 'center',
  },
  heading: {
    fontSize: '20px',
    color: '#fff',
    marginBottom: '10px',
  },
  iconRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
  },
  iconBtn: {
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: '20px',
  },
  labels: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '10px',
  },
  labelText: {
    fontSize: '14px',
    color: '#555',
  },
  modal: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '80%',
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.2)',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    overflowY: 'auto',
    zIndex: 1000,
  },
  modalHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#1e1e1e',
    zIndex: 1001,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    borderBottom: '1px solid #444',
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    color: '#ffffff',
    cursor: 'pointer',
  },
  modalContent: {
    padding: '20px',
  },
};