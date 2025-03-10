"use client"; // Ensures this runs only on the client side
import { useEffect, useState, useRef } from "react";

const CommentSection = () => {
  const [pageUrl, setPageUrl] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [commentsPerPage] = useState(10);
  const commentInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Get Page URL and User Info
  useEffect(() => {
    setPageUrl(window.location.href.split("#")[0]); // Remove hash fragment
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setCurrentUser(userInfo ? userInfo.data : null);
  }, []);

  // Fetch Comments
  const fetchComments = async () => {
    if (!pageUrl) return;
    try {
      const response = await fetch(
        `/api/comments?pageUrl=${encodeURIComponent(pageUrl)}&page=${currentPage}&limit=${commentsPerPage}&userId=${currentUser?.id}`
      );
      const data = await response.json();
      setComments((prev) => (currentPage > 0 ? [...prev, ...data] : data));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    if (pageUrl) fetchComments();
  }, [pageUrl, currentPage]);

  // Format Time Ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];
    for (const { label, seconds: intervalSeconds } of intervals) {
      const count = Math.floor(seconds / intervalSeconds);
      if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
    return "just now";
  };

  return (
    <div>
      <h1>Comment Section</h1>
      <textarea ref={commentInputRef} placeholder="Write a comment..." />
      <div className="file-input-container">
        <label className="file-input-label">
          <i className="fas fa-image"></i>
          <input ref={imageInputRef} type="file" accept="image/*" hidden />
        </label>
        <label className="file-input-label">
          <i className="fas fa-video"></i>
          <input ref={videoInputRef} type="file" accept="video/*" hidden />
        </label>
      </div>
      <button onClick={() => console.log("Post Comment")}>Post Comment</button>

      <div id="comment-section">
        {comments.map((comment) => {
          const userLiked = currentUser && comment.likes.includes(currentUser.id);
          const isOwner = currentUser && currentUser.id === comment.userId;
          return (
            <div key={comment._id} id={`comment-${comment._id}`}>
              <div>
                <p>
                  <img
                    src={comment.userImage || "default-avatar.png"}
                    alt={comment.user}
                    width="60"
                    height="60"
                  />
                  <strong>{comment.user}</strong> - <span className="time-ago">{formatTimeAgo(new Date(comment.createdAt))}</span>
                </p>
                <p>{comment.content}</p>
                {comment.image && <img src={comment.image} alt="Comment Image" width="200" />}
                {comment.video && <video src={comment.video} controls width="300"></video>}
                <div>
                  <span onClick={() => console.log("Toggle Like")} style={{ cursor: "pointer" }}>
                    {userLiked ? "❤️" : "🤍"} ({comment.likes.length})
                  </span>
                  {isOwner && (
                    <>
                      <button onClick={() => console.log("Edit Comment")}>Edit</button>
                      <button onClick={() => console.log("Delete Comment")}>Delete</button>
                    </>
                  )}
                </div>
                <button onClick={() => console.log("Reply")}>Reply</button>
                <button onClick={() => console.log("Show Replies")}>View Replies</button>
              </div>
            </div>
          );
        })}
      </div>

      {comments.length === commentsPerPage && (
        <button onClick={() => setCurrentPage((prev) => prev + 1)}>Load More</button>
      )}

      {/* Replies Modal */}
      <div id="replies-modal">
        <div className="modal-header">Replies</div>
        <div id="replies-modal-body" className="modal-body"></div>
        <div className="modal-footer">
          <button onClick={() => console.log("Close Replies")}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
