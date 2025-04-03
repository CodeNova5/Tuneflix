"use client";

import React, { useState, useEffect } from "react";
import CommentSection from "../components/CommentSection";
import React from 'react';
import RelatedSongsFetcher from '../RelatedSongsFetcher';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Disable background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = ""; // Reset scrolling
    }

    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  return (
    <div
      style={{
        backgroundColor: "#121212", // Dark mode background
        color: "#ffffff", // Dark mode text color
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1>Welcome to the Music App</h1>
      <button
        onClick={toggleModal}
        style={{
          padding: "10px 20px",
          backgroundColor: "#333333", // Dark mode button background
          color: "#ffffff", // Button text color
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {isModalOpen ? "Close Comments" : "Open Comments"}
      </button>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "80%",
            backgroundColor: "#1e1e1e", // Dark mode modal background
            color: "#ffffff", // Modal text color
            boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.2)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: "sticky", // Keeps the header fixed at the top
              top: 0,
              backgroundColor: "#1e1e1e", // Match modal background
              zIndex: 1001, // Ensure it stays above the content
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 20px",
              borderBottom: "1px solid #444", // Dark mode border
            }}
          >
            <h2>Comments</h2>
            <button
              onClick={toggleModal}
              style={{
                backgroundColor: "transparent",
                border: "none",
                fontSize: "20px",
                color: "#ffffff", // Close button color
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>
          <div style={{ padding: "20px" }}>
            <CommentSection />
          </div>
<RelatedSongsFetcher />
        </div>
      )}
    </div>
  );
}