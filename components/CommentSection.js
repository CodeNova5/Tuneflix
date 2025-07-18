'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './CommentSection.module.css';
import { usePathname } from 'next/navigation';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useRouter } from 'next/navigation';

const CommentSection = () => {
  const router = useRouter();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit] = useState(100);
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
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB limit for images

    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file size
    if (type === 'image' && selectedFile.size > MAX_IMAGE_SIZE) {
      alert(`File size exceeds the limit! Max size: 10MB`);
      e.target.value = ''; // Reset input
      return;
    }

    // Set file state
    if (type === 'image') setImage(selectedFile);

    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = ''; // Clear any existing preview

    const fileType = selectedFile.type;
    if (fileType.startsWith('image/')) {
      // Handle image preview
      const img = document.createElement('img');
      img.src = URL.createObjectURL(selectedFile);
      img.classList.add('preview-image');
      img.style.height = '100px';
      img.style.width = '100px';
      previewContainer.appendChild(img);
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
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("fileName", file.name);

    const uploadResponse = await fetch('/api/comments/uploadFile?type=commentFile', {
      method: 'POST',
      body: formData,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to GitHub');
    }

    return uploadData.path; // Assuming the GitHub API response contains the download URL
  }

  const postComment = async () => {
    if (!content) return alert('Comment cannot be empty');
    if (!currentUser) {
      alert('You must login in to comment');
      router.push('/login');
      return;
    }
    if (!pageUrl) return alert('Page URL not found');
    // Show the spinner
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.style.display = 'block';

    const formData = new FormData();
    formData.append('pageUrl', pageUrl);
    formData.append('content', content);
    formData.append('user', currentUser.name);
    formData.append('userId', currentUser.sub || currentUser.id);
    formData.append('userImage', currentUser.picture);

    let uploadedImagePath = '';

    if (image) {
      const imagePath = await uploadFileToGitHub(image, 'image');
      uploadedImagePath = imagePath;
    }

    formData.append('imagePath', uploadedImagePath);


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

      // Clear the preview container
      const previewContainer = document.getElementById('previewContainer');
      if (previewContainer) previewContainer.innerHTML = '';
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error posting comment');
    } finally {
      setLoading(false);
      // Hide the spinner
      if (spinner) spinner.style.display = 'none';
    }
  };



  async function replyToComment(commentId, replyId, commentOwner, commentOwnerId) {
    let modal = document.getElementById('reply-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'reply-modal';
      modal.style.position = 'fixed';
      modal.style.bottom = '0';  // Position at the bottom of the screen
      modal.style.left = '0';
      modal.style.width = '100%'; // Span the width horizontally
      modal.style.background = 'black';
      modal.style.color = 'white';
      modal.style.padding = '10px'; // Adjusted padding for better fit
      modal.style.boxShadow = '0 -2px 10px rgba(0,0,0,0.1)';
      modal.style.zIndex = 1000;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
  <form id="reply-form" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; border-top: 1px solid #ccc;">
    <textarea id="reply-content" type="text" placeholder="Write a reply..." style=" padding: 8px; border-radius: 20px; border: 1px solid #ccc; outline: none; height: 40px; width: 80%;"></textarea>
    <button type="submit" style="background: none; color: white; border: none; cursor: pointer; font-size: 16px;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" style="fill: #1F51FF; transform: rotate(50deg);">
        <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"/>
      </svg>
    </button>
  </form>
  <p id="reply-error" style="color: red; display: none; padding: 5px;">Error submitting reply. Please try again.</p>
`;
    modal.style.display = 'block';
    showReplies(commentId); // Show replies in the modal
    const textarea = document.getElementById("reply-content");
    textarea.addEventListener("input", () => {
      textarea.style.height = "auto"; // Reset height to calculate new height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set height based on content
    });

textarea.focus();

        const form = document.getElementById('reply-form');
    const errorMsg = document.getElementById('reply-error');
    form.onsubmit = async (e) => {
      e.preventDefault();

      if (!currentUser) {
        alert("Please log in to reply.");

        router.push('/login');
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
    modal.style.color = 'white';
    modal.style.background = 'black';
    modal.style.padding = '20px';
    modal.style.border = '1px solid #ccc';
    modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    modal.style.zIndex = 1000;

    modal.innerHTML = `
        <h3>Edit Reply</h3>
        <textarea id="edit-reply-content" style="width: 100%; height: 80px;">${currentContent}</textarea>
        <br>
        <button style="background: green; color: white;  border: none; padding: 5px 10px;" id="save-reply-edit">Save</button>
        <button style="background: red; color: white; border: none; padding: 5px 10px;" id="cancel-reply-edit">Cancel</button>
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
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.style.display = 'block';
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    modal.style.overflowY = 'scroll'; // Enable vertical scrolling
    modal.zIndex = 1001; // Ensure modal is on top
    try {
      const response = await fetch(`/api/comments/${commentId}/reply`);
      const replies = await response.json();

      const commentResponse = await fetch(`/api/comments/${commentId}`);
      const comment = await commentResponse.json();

      // Clear previous content
      modalBody.innerHTML = '';

      // Display the original comment
      const commentElement = document.createElement('div');
      commentElement.classList.add(styles.commentContainer);
      commentElement.innerHTML = `
        <div class="${styles.commentHeader}">
          <img class="${styles.commentAvatar}" src="${comment.userImage}" alt="${comment.user}" />
          <div class="${styles.commentDetails}">
            <strong class="${styles.commentUser}">${comment.user}</strong>
            <span class="${styles.timeAgo}">${formatTimeAgo(new Date(comment.createdAt))}</span>
          </div>
        </div>
        <p class="${styles.commentText}">${comment.content}</p>
        ${comment.image ? `<img class="${styles.commentImage}" src="${comment.image}" alt="Comment Image" />` : ''}
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
        replyElement.classList.add(styles.commentContainer);
        replyElement.innerHTML = `
          <div class="${styles.commentHeader}">
            <img class="${styles.commentAvatar}" src="${reply.userImage}" alt="${reply.user}" />
            <div class="${styles.commentDetails}">
              <strong class="${styles.commentUser}">${reply.user}</strong>
              <span class="${styles.timeAgo}">${timeAgo}</span>
            </div>
          </div>
          ${reply.replyTo ? `<span style="color: blue;">@${replyTo}</span> ` : ''}
          <p class="${styles.commentText}">${reply.content}</p>
          ${reply.image ? `<img class="${styles.commentImage}" src="${reply.image}" alt="Reply Image" />` : ''}
          <div class="${styles.commentActions}">
            <span class="${styles.likeButton}" data-comment-id="${commentId}" data-reply-id="${reply._id}" data-liked="${likedByUser}" style="cursor: pointer; color: ${likedByUser ? 'blue' : 'gray'};">
              ❤️ <span class="like-count">${(reply.likes || []).length}</span>
            </span>
            <button class="${styles.editButton}" data-comment-id="${commentId}" data-reply-id="${reply._id}" data-content="${reply.content}">Edit</button>
            <button class="${styles.deleteButton}" data-comment-id="${commentId}" data-reply-id="${reply._id}">Delete</button>
            <button class="${styles.replyButton}" data-comment-id="${commentId}" data-reply-id="${reply._id}" data-user="${reply.user}" data-user-id="${reply.userId}">Reply</button>
          </div>
        `;
        modalBody.appendChild(replyElement);
      });

      // Attach event listeners to buttons
      document.querySelectorAll(`.${styles.editButton}`).forEach(button => {
        button.addEventListener('click', function () {
          editReply(this.dataset.commentId, this.dataset.replyId, this.dataset.content);
        });
      });

      document.querySelectorAll(`.${styles.deleteButton}`).forEach(button => {
        button.addEventListener('click', function () {
          deleteReply(this.dataset.commentId, this.dataset.replyId);
        });
      });

      document.querySelectorAll(`.${styles.replyButton}`).forEach(button => {
        button.addEventListener('click', function () {
          replyToComment(this.dataset.commentId, this.dataset.replyId, this.dataset.user, this.dataset.userId);
        });
      });

      document.querySelectorAll(`.${styles.likeButton}`).forEach(button => {
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
    }
    document.getElementById('replies-modal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.style.display = 'none';
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
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight(); // Ensure proper height on initial render
  }, []);
  const imageInputRef = useRef(null);

  return (
    <div className={styles.commentSection}>
      <div id="spinner" className={styles.spinner} style={{ display: "none" }}>

      </div>
      <h1 className={styles.commentTitle}>Comment Section</h1>
      <div style={{ position: "fixed", bottom: "0", left: "0", width: "100%", backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderTop: "1px solid #ccc" }}>
        <div id="previewContainer" className="previewContainer"></div>
        <label className={styles.commentLabel} onClick={() => imageInputRef.current.click()}>
          <i className="fas fa-image"></i>
        </label>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFileChange(e, "image")}
        />
        <textarea
          ref={textareaRef}
          rows="1"
          onInput={adjustHeight}
          className={styles.commentInput}
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <div className={styles.fileInputContainer}>

        </div>
        <button type="submit" className={styles.commentSubmit} onClick={postComment} disabled={loading}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="25" height="25" style={{ fill: "#1F51FF", transform: "rotate(50deg)" }}>
            <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
          </svg>
        </button>
      </div>

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
                  <strong className={styles.commentUser}>{comment.user}          </strong>
<span className={styles.timeAgo}>{comment.timeAgo}</span>
                </div>
              </div>
              <p className={styles.commentText}>{comment.content}</p>
              {comment.image && <img className={styles.commentImage} src={comment.image} alt="Comment" />}

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
                  <div>({comment.replies.length})</div>
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