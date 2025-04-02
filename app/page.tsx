"use client";

import React, { useState } from "react";
import CommentSection from "../components/CommentSection";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div>
      <h1>Welcome to the Music App</h1>
      <button
        onClick={toggleModal}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
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
            backgroundColor: "#fff",
            boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.2)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 20px",
              borderBottom: "1px solid #ddd",
            }}
          >
            <h2>Comments</h2>
            <button
              onClick={toggleModal}
              style={{
                backgroundColor: "transparent",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>
          <div style={{ padding: "20px" }}>
            <CommentSection />
          </div>
        </div>
      )}
    </div>
  );
}