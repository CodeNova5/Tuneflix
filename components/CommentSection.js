'use client';

import { useState, useEffect } from 'react';
import styles from './CommentSection.module.css';

const CommentSection = () => {
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [limit] = useState(5);

    const pageUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            const response = await fetch(`/api/comments?pageUrl=${encodeURIComponent(pageUrl)}&page=${page}&limit=${limit}`);
            const data = await response.json();
            setComments(data);
        };

        fetchComments();
    }, [page, pageUrl, limit]);

    // Handle file selection
    const handleFileChange = (e, type) => {
        if (type === 'image') setImage(e.target.files[0]);
        else setVideo(e.target.files[0]);
    };

    // Post comment
    const postComment = async () => {
        if (!content) return alert('Comment cannot be empty');

        const formData = new FormData();
        formData.append('pageUrl', pageUrl);
        formData.append('content', content);
        formData.append('user', 'John Doe'); // Replace with actual user data
        formData.append('userId', '12345'); // Replace with actual user ID
        formData.append('userImage', '/default-avatar.png'); // Replace with actual user image
        if (image) formData.append('image', image);
        if (video) formData.append('video', video);

        setLoading(true);

        const response = await fetch('/api/comments', {
            method: 'POST',
            body: formData,
        });

        const newComment = await response.json();
        setComments([newComment, ...comments]);
        setContent('');
        setImage(null);
        setVideo(null);
        setLoading(false);
    };

    return (
        <div className={styles.commentContainer}>
            <h1>Comment Section</h1>
            <textarea
                className={styles.textarea}
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <div className={styles.fileInputContainer}>
                <label className={styles.fileInputLabel}>
                    <i className="fas fa-image"></i>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                </label>
                <label className={styles.fileInputLabel}>
                    <i className="fas fa-video"></i>
                    <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                </label>
            </div>
            <button onClick={postComment} disabled={loading}>
                {loading ? 'Posting...' : 'Post Comment'}
            </button>
            <div className={styles.commentSection}>
                {comments.map((comment) => (
                    <div key={comment._id} className={styles.comment}>
                        <img src={comment.userImage || '/default-avatar.png'} alt={comment.user} width="40" />
                        <div>
                            <strong>{comment.user}</strong>
                            <p>{comment.content}</p>
                            {comment.image && <img src={comment.image} alt="Comment" width="200" />}
                            {comment.video && <video src={comment.video} controls width="300"></video>}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => setPage(page + 1)}>Load More</button>
        </div>
    );
};

export default CommentSection;
