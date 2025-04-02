"use client";

import React, { useState } from "react";
import CommentSection from "../components/CommentSection";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      style={{
        backgroundColor: isDarkMode ? "#121212" : "#f9f9f9",
        color: isDarkMode ? "#ffffff" : "#000000",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1>Welcome to the Music App</h1>
      <button
        onClick={toggleDarkMode}
        style={{
          padding: "10px 20px",
          backgroundColor: isDarkMode ? "#333333" : "#0070f3",
          color: "#ffffff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "10px",
        }}
      >
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <button
        onClick={toggleModal}
        style={{
          padding: "10px 20px",
          backgroundColor: isDarkMode ? "#333333" : "#0070f3",
          color: "#ffffff",
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
            backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#000000",
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
              borderBottom: isDarkMode ? "1px solid #444" : "1px solid #ddd",
            }}
          >
            <h2>Comments</h2>
            <button
              onClick={toggleModal}
              style={{
                backgroundColor: "transparent",
                border: "none",
                fontSize: "20px",
                color: isDarkMode ? "#ffffff" : "#000000",
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