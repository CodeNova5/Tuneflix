"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const headerStyle = {
  position: "fixed",
  top: 0,
  width: "100%",
  height: "60px",
  backgroundColor: "#111",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  zIndex: 1000,
};

const profileImgLinkStyle = {
  position: "absolute",
  left: "20px",
  cursor: "pointer",
};

const profileImgStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
};

const siteNameStyle = {
  fontSize: "1.5rem",
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
};

const searchIconStyle = {
  position: "absolute",
  right: "20px",
  color: "white",
  fontSize: "1.2rem",
  textDecoration: "none",
};

const userInfoBoxStyle = {
  position: "absolute",
  top: "60px",
  left: "20px",
  backgroundColor: "#222",
  color: "white",
  padding: "15px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
  zIndex: 1001,
  width: "250px",
};

const fullProfileImgStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  display: "block",
  marginBottom: "10px",
};

const Header = () => {
  const [profileImg, setProfileImg] = useState("/images/default-profile.png");
  const [userInfo, setUserInfo] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const userInfoRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo") || "null");
    if (storedUser && storedUser.data) {
      setUserInfo(storedUser);
      if (storedUser.provider === "google") {
        setProfileImg(storedUser.data.picture || "/images/default-profile.png");
      } else if (storedUser.provider === "facebook") {
        setProfileImg(storedUser.data.picture?.data?.url || "/images/default-profile.png");
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        userInfoRef.current &&
        !userInfoRef.current.contains(e.target)
      ) {
        setShowUserInfo(false);
      }
    };

    const handleScroll = () => {
      setShowUserInfo(false);
    };

    if (showUserInfo) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showUserInfo]);

  const toggleUserInfo = () => {
    setShowUserInfo((prev) => !prev);
  };

  return (
    <header style={headerStyle}>
      <div onClick={toggleUserInfo} style={profileImgLinkStyle}>
        <img src={profileImg} alt="Profile" style={profileImgStyle} />
      </div>

      {showUserInfo && userInfo && (
        <div style={userInfoBoxStyle} ref={userInfoRef}>
          <img src={profileImg} alt="Profile" style={fullProfileImgStyle} />
          <div><strong>{userInfo.data.name || "No Name"}</strong></div>
          <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>
            ID: {userInfo.data.sub || userInfo.data.id || "N/A"}
          </div>
          <div style={{ marginTop: "10px" }}>
            <Link href="/login" style={{ color: "#4fc3f7", textDecoration: "underline" }}>
              Switch Account
            </Link>
          </div>
        </div>
      )}

      <Link href="/" style={siteNameStyle}>Tuneflix</Link>
      <Link href="/search" style={searchIconStyle}>
        <FontAwesomeIcon icon={faSearch} />
      </Link>
    </header>
  );
};

export default Header;
