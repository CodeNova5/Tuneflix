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
    const [currentUser, setCurrentUser] = useState(null);
    const pathname = usePathname(); // Get the current path in Next.js
    const [formattedComments, setFormattedComments] = useState([]);
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState("");



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
    const handleEdit = (comment) => {
        setEditingComment(comment);  // Store the full comment object
        setEditContent(comment.content);  // Set the text area value
    };
    ;

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
    
    useEffect(() => {
        if (pageUrl) fetchComments();
    }, [page, pageUrl, limit]);

    async function deleteComment(commentId) {
        const confirmDelete = confirm("Are you sure you want to delete this comment and all its replies?");
        if (!confirmDelete) return;
      
        try {
          const response = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: currentUser.sub || currentUser.id }),
          });
      
          const data = await response.json();
      
          if (!response.ok) {
            throw new Error(data.message || "Failed to delete the comment.");
          }
      
          alert('Comment deleted successfully.');
          fetchComments(); // Refresh the comments after deletion
        } catch (error) {
          console.error('Error deleting comment:', error);
          alert(error.message);
        }
      }
      
    const saveEdit = async () => {
        if (!editContent.trim()) {
            alert("Comment cannot be empty.");
            return;
        }
    
        try {
            const response = await fetch(`/api/comments/${editingComment._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: currentUser.sub || currentUser.id,
                    content: editContent,
                }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            alert("Comment updated successfully.");
            setEditingComment(null);
    
            // Fetch updated comments
            await fetchComments();
        } catch (error) {
            console.error("Error updating comment:", error);
            alert("Failed to update the comment.");
        }
    };
    
    useEffect(() => {
        setFormattedComments(
            comments.map((comment) => ({
                ...comment,
                timeAgo: formatTimeAgo(new Date(comment.createdAt)),
            }))
        );
    }, [comments]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPageUrl(window.location.href); // Set full URL dynamically
        }
    }, [pathname]); // Run effect when pathname changes

    useEffect(() => {
        // Fetch user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
        setCurrentUser(userInfo.data ? userInfo.data : null);
    }, []);


    // Handle file selection
    const handleFileChange = (e, type) => {
        if (type === 'image') setImage(e.target.files[0]);
        else setVideo(e.target.files[0]);
    };

    async function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64String = reader.result.split(',')[1]; // Remove the "data:image/png;base64," prefix ok
            resolve(base64String);
          };
          reader.onerror = error => reject(error);
        });
      }
      
    async function uploadFileToGitHub(file, type) {
        // Convert file to base64
        const base64Content = await convertFileToBase64(file);
    
        const fileName = file.name;
        // Call the GitHub upload API (from your previous code)
        const uploadResponse = await fetch('/api/uploadFile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileName: fileName,
                fileContent: base64Content
            })
        });
    
        const uploadData = await uploadResponse.json();
    
        if (!uploadResponse.ok) {
            throw new Error('Failed to upload file to GitHub');
        }
    
        return uploadData.path;  // Assuming the GitHub API response contains the download URL
    }
    
    const postComment = async () => {
    if (!content) return alert('Comment cannot be empty');
    if (!currentUser) return alert('User not found');
    if (!pageUrl) return alert('Page URL not found'); // Ensure pageUrl is set
    const spinner = document.getElementById('spinner');

    spinner.style.display = 'block';

    const formData = new FormData();
    formData.append('pageUrl', pageUrl);
    formData.append('content', content);
    formData.append('user', currentUser.name);
    formData.append('userId', currentUser.sub || currentUser.id);
    formData.append('userImage', currentUser.picture);

    // Handle file upload to GitHub if an image or video is selected
    let uploadedImagePath = '';
    let uploadedVideoPath = '';

    if (image) {
        const imagePath = await uploadFileToGitHub(image, 'image'); // Call your previous upload function for image
        uploadedImagePath = imagePath;  // Get the path from the upload function
    }

    if (video) {
        const videoPath = await uploadFileToGitHub(video, 'video'); // Call your previous upload function for video
        uploadedVideoPath = videoPath; // Get the path from the upload function
    }

    // Ensure fresh paths by appending a timestamp
const freshImagePath = uploadedImagePath ? `${uploadedImagePath}?timestamp=${Date.now()}` : null;
const freshVideoPath = uploadedVideoPath ? `${uploadedVideoPath}?timestamp=${Date.now()}` : null;

// Add the file paths to the form data before submitting
if (freshImagePath) formData.append('imagePath', freshImagePath);
if (freshVideoPath) formData.append('videoPath', freshVideoPath);
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
    finally {
        // Clear input fields
        setContent('');
        setImage(null);
        setVideo(null);
    }

    setLoading(false);
};

const [file, setFile] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    const previewContainer = document.getElementById('previewContainer');

    // Clear any existing preview
    previewContainer.innerHTML = '';

    if (selectedFile) {
      const fileType = selectedFile.type;

      if (fileType.startsWith('image/')) {
        // Handle image preview
        const img = document.createElement('img');
        img.src = URL.createObjectURL(selectedFile);
        img.classList.add('preview-image'); // Add class for styling
        previewContainer.appendChild(img);
      } else if (fileType.startsWith('video/')) {
        // Handle video preview
        const video = document.createElement('video');
        video.src = URL.createObjectURL(selectedFile);
        video.controls = true; // Add controls to the video element
        video.classList.add('preview-video'); // Add class for styling
        previewContainer.appendChild(video);
      }
    }
  };
    return (
        <div className={styles.commentSection}>
            <div id='spinner' style="display :none;"></div>
            <h1 className={styles.commentTitle}>Comment Section</h1>
            <textarea
                className={styles.commentInput}
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <div className={styles.fileInputContainer}>
            <div id="previewContainer"></div>
                <label className={styles.commentLabel}>
                    <i className="fas fa-image"></i>
                    <input type="file" accept="image/*" onChange={handleFileSelect} />
                </label>
                <label className={styles.commentLabel}>
                    <i className="fas fa-video"></i>
                    <input type="file" accept="video/*" onChange={handleFileSelect}  />
                </label>
            </div>
            <button className={styles.commentSubmit} onClick={postComment} disabled={loading}>
                {loading ? 'Posting...' : 'Post Comment'}
            </button>
            
            <div className={styles.commentSection}>
                {formattedComments.map((comment) => {
                    const isOwner =
                        currentUser &&
                        (currentUser.sub === comment.userId || currentUser.id === comment.userId);
                        
                    return (
                        <div key={comment._id} className={styles.commentContainer}>
                        <div className={styles.commentHeader}>
                            <img className={styles.commentAvatar} src={comment.userImage} alt={comment.user} />
                            <div className={styles.commentDetails}>
                                <strong className={styles.commentUser}>{comment.user}</strong>
                                <span className={styles.timeAgo}>{comment.timeAgo}</span>
                            </div>
                        </div>
                        <p className={styles.commentText}>{comment.content}</p>
                        {comment.image && <img className={styles.commentImage} src={comment.image} alt="Comment" />}

                        {comment.video && <video className={styles.commentVideo} src={comment.video} controls />}
                        
                        <div className={styles.commentActions}>
                            <span className={styles.likeButton} onClick={() => toggleLike(comment._id, comment.userLiked)}>
                                {comment.userLiked ? '❤️' : '🤍'} ({comment.likes.length})
                            </span>
                            {isOwner && (
                                <>
                                    <button className={styles.editButton} onClick={() => handleEdit(comment)}>Edit</button>
                                    <button className={styles.deleteButton} onClick={() => deleteComment(comment._id)}>Delete</button>
                                </>
                            )}
                        </div>
                        
                        <div className={styles.replyActions}>
                            <button className={styles.replyButton} onClick={() => replyToComment(comment._id)}>Reply</button>
                            <button className={styles.viewRepliesButton} onClick={() => showReplies(comment._id)}>View Replies</button>
                        </div>
                    </div>
                    
                    );
                })}
            </div>

            <button className={styles.commentButton} onClick={() => setPage(page + 1)}>Load More</button>
         {/* Edit Comment Modal */}
      {editingComment && (
        <div className={styles.editModal}>
          <div className={styles.editModalContent}>
            <h3>Edit Comment</h3>
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className={styles.editTextarea}></textarea>
            <div className={styles.editButtons}>
              <button onClick={saveEdit} className={styles.saveEditButton}>
                Save
              </button>
              <button onClick={() => setEditingComment(null)} className={styles.cancelEditButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
    );
};

export default CommentSection;
