'use client';

import { useState, useEffect } from 'react';
import styles from './CommentSection.module.css';
import { usePathname } from 'next/navigation';
const CommentSection = () => {
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [limit] = useState(5);
    const [pageUrl, setPageUrl] = useState('');
    const pathname = usePathname(); // Get the current path in Next.js

    const [formattedComments, setFormattedComments] = useState([]);

    useEffect(() => {
      setFormattedComments(
        comments.map((comment) => ({
          ...comment,
          timeAgo: formatTimeAgo(new Date(comment.createdAt)),
        }))
      );
    }, [comments]);
    // Function to format the time ago
    const formatTimeAgo = (date) => {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return interval === 1 ? "1 year ago" : `${interval} years ago`;
  
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return interval === 1 ? "1 month ago" : `${interval} months ago`;
  
      interval = Math.floor(seconds / 604800);
      if (interval >= 1) return interval === 1 ? "1 week ago" : `${interval} weeks ago`;
  
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return interval === 1 ? "1 day ago" : `${interval} days ago`;
  
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  
      return "Just now";
    };
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPageUrl(window.location.href); // Set full URL dynamically
        }
    }, [pathname]); // Run effect when pathname changes

    useEffect(() => {
        // Fetch user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
        setCurrentUser(userInfo.data || {});

    }, []);

    useEffect(() => {
        if (!pageUrl) return; // Prevent fetching when pageUrl is undefined

        const fetchComments = async () => {
            try {
                const response = await fetch(`/api/comments?pageUrl=${encodeURIComponent(pageUrl)}&page=${page}&limit=${limit}`);
                if (!response.ok) throw new Error('Failed to fetch comments');
                const data = await response.json();
                setComments(data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [page, pageUrl, limit]);

    // Handle file selection
    const handleFileChange = (e, type) => {
        if (type === 'image') setImage(e.target.files[0]);
        else setVideo(e.target.files[0]);
    };
    const postComment = async () => {
        if (!content) return alert('Comment cannot be empty');
        if (!currentUser) return alert('User not found');
        if (!pageUrl) return alert('Page URL not found'); // Ensure pageUrl is set

        const formData = new FormData();
        formData.append('pageUrl', pageUrl);
        formData.append('content', content);
        formData.append('user', currentUser.name);
        formData.append('userId', currentUser.sub || currentUser.id);
        formData.append('userImage', currentUser.picture);
        if (image) formData.append('image', image);
        if (video) formData.append('video', video);

        setLoading(true);

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to post comment');

            const newComment = await response.json();
            setComments([newComment, ...comments]);
            setContent('');
            setImage(null);
            setVideo(null);
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Error posting comment');
        }

        setLoading(false);
    };
    const isOwner =
    currentUser &&
    (currentUser.sub === comment.userId || currentUser.id === comment.userId);


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
            <button className={styles.commentSubmit} onClick={postComment} disabled={loading}>
                {loading ? 'Posting...' : 'Post Comment'}
            </button>

            <div className={styles.commentSection}>
                 {formattedComments.map((comment) => (
                    
                    <div key={comment._id}>
                        <img className={styles.commentAvatar} src={comment.userImage} alt={comment.user} width="40" />
                        <div>
                            <strong className={styles.commentUser}>{comment.user}</strong>
                           -  <span className={styles.commentDate}>{comment.timeAgo}</span>
                            <p className={styles.commentText}>{comment.content}</p>
                            {comment.image && <img className={styles.img} src={comment.image} alt="Comment" width="200" />}
                            {comment.video && <video className={styles.video} src={comment.video} controls width="300"></video>}
                            <div className={styles.commentActions}>
                                <span className={styles.span} onClick={() => toggleLike(comment._id, comment.userLiked)}>
                                    {comment.userLiked ? '❤️' : '🤍'} ({comment.likes.length})
                                </span>

                                {comment.isOwner && (
                                    <>
                                        <button className={styles.editButton} onClick={() => editComment(comment._id, comment.content)}>Edit</button>
                                        <button className={styles.deleteButton} onClick={() => deleteComment(comment._id)}>Delete</button>
                                    </>
                                )}
                            </div>

                            <div className={styles.replyActions}>
                                <button className={styles.replyButton} onClick={() => replyToComment(comment._id, null, comment.user, comment.userId)}>Reply</button>
                                <button className={styles.viewRepliesButton} onClick={() => showReplies(comment._id)}>View Replies</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className={styles.commentButton} onClick={() => setPage(page + 1)}>Load More</button>
        </div>
    );
};

export default CommentSection;
