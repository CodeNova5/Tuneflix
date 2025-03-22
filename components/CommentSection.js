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
    setEditingComment(comment); // Store the full comment object
    setEditContent(comment.content); // Set the text area value
  };;

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/comments?pageUrl=${encodeURIComponent(pageUrl)}&page=${page}&limit=${limit}`);
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

    const selectedFile = e.target.files[0];
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
        video.classList.add('preview-video'); // Add class for styling b
        previewContainer.appendChild(video);
      }
    }
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

    return uploadData.path; // Assuming the GitHub API response contains the download URL
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
      uploadedImagePath = imagePath; // Get the path from the upload function
    }

    if (video) {
      const videoPath = await uploadFileToGitHub(video, 'video'); // Call your previous upload function for video
      uploadedVideoPath = videoPath; // Get the path from the upload function
    }

    formData.append('imagePath', uploadedImagePath);

    formData.append('videoPath', uploadedVideoPath);
    setLoading(true);

    try {
      const response = await fetch('/api/comments/comments', {
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
    }

    setLoading(false);
  };

  async function replyToComment(commentId, replyId, commentOwner, commentOwnerId) {
showReplies(commentId);
    let modal = document.getElementById('reply-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'reply-modal';
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.background = 'black';
      modal.style.padding = '20px';
      modal.style.border = '1px solid';
      modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      modal.style.zIndex = 1000;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `  
    <form id="reply-form" style="display: flex; align-items: center; gap: 8px; padding: 10px; border-top: 1px solid #ccc;">  
       <input id="reply-content" type="text" placeholder="Write a reply..." style="flex: 1; padding: 8px; border-radius: 20px; border: 1px solid #ccc; outline: none;">  
        <button type="submit" style="background: none; border: none; cursor: pointer;">  
            <i class="fas fa-paper-plane" style="font-size: 18px; color: #1877F2;"></i>  
        </button>  
    </form>  
    <p id="reply-error" style="color: red; display: none; padding: 5px;">Error submitting reply. Please try again.</p>  
`;

const textarea = document.getElementById("reply-content");
textarea.focus(); // Focus the textarea
const form = document.getElementById('reply-form');
    const errorMsg = document.getElementById('reply-error');
    form.onsubmit = async (e) => {
      e.preventDefault();

      if (!currentUser) {
        alert("Please log in to reply.");
        return;
      }

      const replyContent = document.getElementById('reply-content').value.trim();
      if (!replyContent) {
        alert("Reply content cannot be empty.");
        return;
      }

      const formData = {
        content: replyContent,
        replyTo: commentOwner,
        user: currentUser.name,
        userId: currentUser.sub || currentUser.id,
        commentOwnerId: commentOwnerId,
        userImage: currentUser.picture,
        fcmtoken: localStorage.getItem('fcmToken'),
        replyId: replyId,
      };

      const url = `/api/comments/${commentId}/reply`;

      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        showReplies(commentId); // Refresh the replies in the modal
        modal.style.display = 'none';
      } catch (error) {
        errorMsg.style.display = 'block';
      }
    };

    document.getElementById('close-modal').onclick = () => {
      modal.style.display = 'none';
    };

    modal.style.display = 'block';
  }

  // Function to edit a reply
  function editReply(commentId, replyId, currentContent) {
    // Create an edit modal
    const modal = document.createElement('div');
    modal.id = 'edit-reply-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.background = 'white';
    modal.style.padding = '20px';
    modal.style.border = '1px solid #ccc';
    modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    modal.style.zIndex = 1000;

    modal.innerHTML = `
        <h3>Edit Reply</h3>
        <textarea id="edit-reply-content" style="width: 100%; height: 80px;">${currentContent}</textarea>
        <br>
        <button id="save-reply-edit">Save</button>
        <button id="cancel-reply-edit">Cancel</button>
    `;

    document.body.appendChild(modal);

    // Handle save action
    document.getElementById('save-reply-edit').onclick = async () => {
      const updatedContent = document.getElementById('edit-reply-content').value;

      if (!updatedContent.trim()) {
        alert('Reply cannot be empty.');
        return;
      }

      try {
        await fetch(`/api/comments/${commentId}/replies/${replyId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.sub || currentUser.id,
            content: updatedContent,
          }),
        });

        alert('Reply updated successfully.');
        document.body.removeChild(modal);
        showReplies(commentId); // Refresh the replies in the modal

      } catch (error) {
        console.error('Error updating reply:', error);
        alert('Failed to update the reply.');
      }
    };

    // Handle cancel action
    document.getElementById('cancel-reply-edit').onclick = () => {
      document.body.removeChild(modal);
    };
  }

  // Function to delete a reply  
  async function deleteReply(commentId, replyId) {
    if (!currentUser) {
      alert("Please log in to delete a reply.");
      return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this reply and all its nested replies?");
    if (!confirmDelete) return;

    try {
      await fetch(`/api/comments/${commentId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.sub || currentUser.id }),
      });

      alert('Reply deleted successfully.'); 
      showReplies(commentId); // Refresh the replies in the modal

    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete the reply.');
    }
  }
  async function toggleReplyLike(commentId, replyId, isLiked) {
    if (!currentUser) {
        alert("Please log in to like/unlike.");
        return;
    }

    await fetch(`/api/comments/${commentId}/replies/${replyId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
    });

    showReplies(commentId); // Refresh the replies in the modal
}
  const showReplies = async (commentId) => {
    const modal = document.getElementById('replies-modal');
    const modalBody = document.getElementById('replies-modal-body');

    // Show loading indicator
    modalBody.innerHTML = '<p>Loading replies...</p>';
    modal.style.display = 'block';

    try {
        const response = await fetch(`/api/comments/${commentId}/reply`);
        const replies = await response.json();

        const commentResponse = await fetch(`/api/comments/${commentId}`);
        const comment = await commentResponse.json();

        // Clear previous content
        modalBody.innerHTML = '';

        // Display the original comment
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment-container');
        commentElement.innerHTML = `
            <div class="comment-header">
                <img class="comment-avatar" src="${comment.userImage}" alt="${comment.user}" />
                <div class="comment-details">
                    <strong class="comment-user">${comment.user}</strong>
                    <span class="comment-time">${formatTimeAgo(new Date(comment.createdAt))}</span>
                </div>
            </div>
            <p class="comment-text">${comment.content}</p>
            ${comment.image ? `<img class="comment-image" src="${comment.image}" alt="Comment Image" />` : ''}
            ${comment.video ? `<video class="comment-video" src="${comment.video}" controls></video>` : ''}
        `;
        modalBody.appendChild(commentElement);

        if (replies.length === 0) {
            modalBody.innerHTML += '<p>No replies yet.</p>';
            return;
        }

        replies.forEach(reply => {
            const timeAgo = formatTimeAgo(new Date(reply.createdAt));
            const replyTo = reply.replyTo || 'unknown';
            const likedByUser = (reply.likes || []).includes(currentUser?.id);

            const replyElement = document.createElement('div');
            replyElement.classList.add('reply-container');
            replyElement.innerHTML = `
                <div class="reply-header">
                    <img class="reply-avatar" src="${reply.userImage}" alt="${reply.user}" />
                    <div class="reply-details">
                        <strong class="reply-user">${reply.user}</strong>
                        <span class="reply-time">${timeAgo}</span>
                    </div>
                </div>
                ${reply.replyTo ? `<span style="color: blue;">@${replyTo}</span> ` : ''}
                <p class="reply-text">${reply.content}</p>
                ${reply.image ? `<img class="reply-image" src="${reply.image}" alt="Reply Image" />` : ''}
                ${reply.video ? `<video class="reply-video" src="${reply.video}" controls></video>` : ''}

                <button class="edit-reply-btn" 
                    data-comment-id="${commentId}" 
                    data-reply-id="${reply._id}" 
                    data-content="${reply.content}">
                    Edit
                </button>
                <button class="delete-reply-btn" 
                    data-comment-id="${commentId}" 
                    data-reply-id="${reply._id}">
                    Delete
                </button>
                <button class="reply-to-reply-btn" 
                    data-comment-id="${commentId}" 
                    data-reply-id="${reply._id}" 
                    data-user="${reply.user}" 
                    data-user-id="${reply.userId}">
                    Reply
                </button>

                <div class="like-reply-btn" 
                    data-comment-id="${commentId}" 
                    data-reply-id="${reply._id}" 
                    data-liked="${likedByUser}" 
                    style="cursor: pointer; color: ${likedByUser ? 'blue' : 'gray'};">
                    ❤️ <span class="like-count">${(reply.likes || []).length}</span> Like
                </div>
            `;
            modalBody.appendChild(replyElement);
        });

        // Attach event listeners to buttons
        document.querySelectorAll('.edit-reply-btn').forEach(button => {
            button.addEventListener('click', function () {
                editReply(this.dataset.commentId, this.dataset.replyId, this.dataset.content);
            });
        });

        document.querySelectorAll('.delete-reply-btn').forEach(button => {
            button.addEventListener('click', function () {
                deleteReply(this.dataset.commentId, this.dataset.replyId);
            });
        });

        document.querySelectorAll('.reply-to-reply-btn').forEach(button => {
            button.addEventListener('click', function () {
                replyToComment(this.dataset.commentId, this.dataset.replyId, this.dataset.user, this.dataset.userId);
            });
        });

        document.querySelectorAll('.like-reply-btn').forEach(button => {
            button.addEventListener('click', function () {
                toggleReplyLike(this.dataset.commentId, this.dataset.replyId, this.dataset.liked === 'true');
            });
        });

    } catch (error) {
        modalBody.innerHTML = `<p>Error loading replies.</p>`;
        console.error('Error fetching replies:', error);
    }
};


  // Close Modal Function
  const closeRepliesModal = () => {
      const modal = document.getElementById('reply-modal');
if (modal) {
modal.style.display = "none";
} document.getElementById('replies-modal').style.display = 'none';
  };
  async function toggleLike(commentId, isLiked) {
    if (!currentUser) {
        alert("Please log in to like a comment.");
        return;
    }

    const userId = currentUser.sub || currentUser.id;

    const url = isLiked
        ? `/api/comments/${commentId}/unlike`
        : `/api/comments/${commentId}/like`;

    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });

    fetchComments(); // Refresh comments to update like counts
}
  return (
    <div className={styles.commentSection}>
      <div id='spinner'></div>
      <h1 className={styles.commentTitle}>Comment Section</h1>
      <textarea
        className={styles.commentInput}
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
      <div className={styles.fileInputContainer}>
        <div id="previewContainer" class="previewContainer" ></div>
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
        {formattedComments.map((comment) => {
          const isOwner =
            currentUser &&
            (currentUser.sub === comment.userId || currentUser.id === comment.userId);
            const userLiked = currentUser && comment.likes.includes(currentUser.sub || currentUser.id);



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
               
<span className={styles.likeButton} onClick={() => toggleLike(comment._id)}>
  {userLiked ? '❤️' : '🤍'} ({comment.likes.length})
</span>
                {isOwner && (
                  <>
                    <button className={styles.editButton} onClick={() => handleEdit(comment)}>Edit</button>
                    <button className={styles.deleteButton} onClick={() => deleteComment(comment._id)}>Delete</button>
                  </>
                )}
              </div>

              <div className={styles.replyActions}>
                <button onClick={() => replyToComment(comment._id, null, comment.user, comment.userId)}> Reply</button>
                {comment.replies.length > 0 && (
    <button id="view-replies" onClick={() => showReplies(comment._id)}>View Replies</button>
)}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "none" }} className={styles.modal} id="replies-modal">
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h3>Replies</h3>
            <button className={styles.closeButton} onClick={closeRepliesModal}>✖</button>
          </div>
          <div className={styles.modalBody} id="replies-modal-body">
            <p>Loading replies...</p>
          </div>
        </div>
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