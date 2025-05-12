import React, { useState } from 'react';
import CommentSection from './CommentSection'; // adjust path as needed

const CommentShareModule = ({ track }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const shareSong = async () => {
    const shareData = {
      title: `${track.name} by ${track.artists.map(a => a.name).join(', ')}`,
      text: `Check out this song: ${track.name} by ${track.artists.map(a => a.name).join(', ')}`,
      url: window.location.href,
    };

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
  };

  return (
    <>
      <div style={styles.container}>
        <h2 style={styles.heading}>Comment and Share</h2>
        <div style={styles.iconRow}>
          <button onClick={toggleModal} aria-label={isModalOpen ? 'Close Comments' : 'Open Comments'} style={styles.iconBtn}>
            <i className="fas fa-comments" style={styles.icon}></i>
          </button>
          <button onClick={shareSong} aria-label="Share Song" style={styles.iconBtn}>
            <i className="fas fa-share-nodes" style={styles.icon}></i>
          </button>
        </div>
        <div style={styles.labels}>
          <span style={styles.labelText}>Comment</span>
          <span style={styles.labelText}>Share</span>
        </div>
      </div>

      {isModalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <h2>Comments</h2>
            <button onClick={toggleModal} style={styles.closeBtn}>✖</button>
          </div>
          <div style={styles.modalContent}>
            <CommentSection />
          </div>
        </div>
      )}
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
