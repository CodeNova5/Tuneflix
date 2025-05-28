"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const [profileImg, setProfileImg] = useState("/images/default-profile.png");
  const [userInfo, setUserInfo] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const userInfoRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const updateSize = () => setWindowWidth(window.innerWidth);
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Only fetch on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchSearchResults(search);
    }
  };


  // Only update search state, don't fetch on change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setResults([]); // Clear results while typing
  };

  const fetchSearchResults = async (query) => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/Music/route?type=search&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.tracks?.items || []);
  };

  useEffect(() => {
    document.body.style.overflow = results.length > 0 ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [results]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo") || "null");
    if (storedUser?.data) {
      setUserInfo(storedUser);
      const picture = storedUser.provider === "google"
        ? storedUser.data.picture
        : storedUser.data.picture?.data?.url;
      setProfileImg(picture || "/images/default-profile.png");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userInfoRef.current && !userInfoRef.current.contains(e.target)) {
        setShowUserInfo(false);
      }
    };
    const handleScroll = () => setShowUserInfo(false);

    if (showUserInfo || notLoggedIn) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showUserInfo, notLoggedIn]);

  const toggleUserInfo = () => {
    if (!userInfo) {
      setNotLoggedIn(true);
      setTimeout(() => router.push("/login"), 1000);
    } else {
      setShowUserInfo((prev) => !prev);
    }
  };

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "60px",
      backgroundColor: "#111",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderBottom: "1px solid #444",
      color: "white",
      zIndex: 1000,
    }}>
      {/* Profile Image */}
      <div onClick={toggleUserInfo} style={{
        position: "absolute",
        left: "20px",
        cursor: "pointer",
      }}>
        <img src={profileImg} alt="Profile" style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
        }} />
      </div>

      {/* User Info Modal */}
      {(showUserInfo && userInfo) && (
        <div style={{
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
        }} ref={userInfoRef}>
          <img src={profileImg} alt="Profile" style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            display: "block",
            marginBottom: "10px",
          }} />
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
      {notLoggedIn && (
        <div style={{
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
        }} ref={userInfoRef}>
          <strong>You are not logged in.</strong>
          <div style={{ marginTop: "10px" }}>Redirecting to login page...</div>
        </div>
      )}

      {/* Site Name */}
      <Link href="/" style={{
        fontSize: windowWidth <= 600 ? "1.2rem" : "1.5rem",
        color: "white",
        textDecoration: "none",
        fontWeight: "bold",
        position: "absolute",
        left: "40%",
        transform: "translateX(-50%)",
      }}>
        Tuneflix
      </Link>

      {/* Search Input */}
      <div style={{
        position: "absolute",
        top: "10px",
        right: "20px",
        display: "flex",
        flexDirection: windowWidth <= 600 ? "column" : "row",
        alignItems: "flex-end",
        gap: "10px",
      }}>
        <div style={{ position: "relative" }}>
          <FontAwesomeIcon
            icon={faSearch}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#aaa",
              pointerEvents: "none",
              fontSize: "1rem",
            }}
          />
          <input
            rows="1"
            placeholder="Search songs..."
            value={search}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            style={{
              padding: "8px 8px 8px 32px",
              borderRadius: "20px",
              border: "1px solid #444",
              backgroundColor: "#222",
              color: "white",
              resize: "none",
              fontSize: "1rem",
              outline: "none",
              width: "140px",
            }}
          />
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div style={{
            position: "fixed",
            top: "60px",
            left: 0,
            width: "100%",
            height: windowWidth <= 600 ? "calc(100% - 60px)" : "80%",
            backgroundColor: "#111",
            zIndex: 1002,
            overflowY: "auto",
            padding: windowWidth <= 600 ? "10px" : "20px",
          }}>
            <button
              onClick={() => {
                setSearch("");
                setResults([]);
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "20px",
                background: "#333",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Cancel
            </button>

            <div style={{ marginTop: "40px" }}>
              {results.map(track => (
                <div key={track.id} style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #444",
                  cursor: "pointer",
                  textAlign: "left",
                }}>
                  <Link href={`/music/${encodeURIComponent(track.artists[0]?.name)}/song/${encodeURIComponent(track.name)}`}>
                    <img
                      src={track.album.images[2]?.url || track.album.images[0]?.url}
                      alt="Album Art"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "4px",
                        marginRight: "15px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <strong style={{ color: "white" }}>{track.name}</strong>
                      <div style={{ fontSize: "0.85rem", color: "#bbb" }}>
                        {track.artists.map(artist => artist.name).join(", ")}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;