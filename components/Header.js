"use client";
import React, { useEffect, useState } from "react";
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

const Header = () => {
  const [profileImg, setProfileImg] = useState("/images/default-profile.png");

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo && userInfo.data) {
      if (userInfo.provider === "google") {
        setProfileImg(userInfo.data.picture || "/images/default-profile.png");
      } else if (userInfo.provider === "facebook") {
        setProfileImg(userInfo.data.picture?.data?.url || "/images/default-profile.png");
      }
    }
  }, []);

  return (
    <header style={headerStyle}>
      <Link href="/profile" style={profileImgLinkStyle}>
        <img src={profileImg} alt="Profile" style={profileImgStyle} />
      </Link>

      <Link href="/" style={siteNameStyle}>
        Tuneflix
      </Link>
      <Link href="/search" style={searchIconStyle}>
        <FontAwesomeIcon icon={faSearch} />
      </Link>
    </header>
  );
};

export default Header;
