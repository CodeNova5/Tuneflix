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
    const [pageUrl, setPageUrl] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPageUrl('https://next-xi-opal.vercel.app'); // Set to static URL


            // Fetch user info from localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
            setCurrentUser(userInfo.data || {});
        }
    }, []);

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
        if (!currentUser) return alert('User not found');

        const formData = new FormData();
        formData.append('pageUrl', pageUrl);
        formData.append('content', content);
        formData.append('user', currentUser.name || 'Guest');
        formData.append('userId', currentUser.sub || currentUser.id || '');
        formData.append('userImage', currentUser.picture);
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
        <div className={styles.commentSection}>
            <h1 className={styles.commentTitle}>Comment Section</h1>
            <textarea
                className={styles.commentInput}
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <div className={styles.fileInputContainer}>
                <label className={styles.commentLabel}>
                    <i className="fas fa-image"></i>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                </label>
                <label className={styles.commentLabel}>
                    <i className="fas fa-video"></i>
                    <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                </label>
            </div>
            <button className={styles.commentButton} onClick={postComment} disabled={loading}>
                {loading ? 'Posting...' : 'Post Comment'}
            </button>
            <div className={styles.commentContainer}>
                {comments.map((comment) => (
                    <div key={comment._id} className={styles.comment}>
                        <img className={styles.commentAvatar} src={comment.userImage || '/default-avatar.png'} alt={comment.user} width="40" />
                        <div>
                            <strong className={styles.commentUser}>{comment.user}</strong>
                            <p className={styles.commentText}>{comment.content}</p>
                            {comment.image && <img className={styles.commentMedia} src={comment.image} alt="Comment" width="200" />}
                            {comment.video && <video className={styles.commentMedia} src={comment.video} controls width="300"></video>}
                        </div>
                    </div>
                ))}
            </div>
            <button className={styles.commentButton} onClick={() => setPage(page + 1)}>Load More</button>
        </div>
    );
};

export default CommentSection;
