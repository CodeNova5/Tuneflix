"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const headerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  marginLeft: "0",
  width: "100%",
  height: "60px",
  backgroundColor: "#111",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderBottom: "1px solid #444",
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
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const userInfoRef = useRef(null);
  const router = useRouter();
  const [search, setSearch] = useState("");

  const [results, setResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);



  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);

    if (typingTimeout) clearTimeout(typingTimeout);

    setTypingTimeout(setTimeout(() => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }
      fetchSearchResults(query);
    }, 400)); // debounce delay
  };

  const fetchSearchResults = async (query) => {
    const res = await fetch(`/api/Music/route?type=search&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.tracks?.items || []);
  };
  
  useEffect(() => {
    if (results.length > 0) {
      document.body.style.overflow = "hidden"; // disable background scroll
    } else {
      document.body.style.overflow = ""; // re-enable scroll
    }

    return () => {
      document.body.style.overflow = ""; // cleanup on unmount
    };
  }, [results]);

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
      if (userInfoRef.current && !userInfoRef.current.contains(e.target)) {
        setShowUserInfo(false);
      }
    };

    const handleScroll = () => {
      setShowUserInfo(false);
    };

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
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } else {
      setShowUserInfo((prev) => !prev);
    }

  };

  return (
    <header style={headerStyle}>
      <div onClick={toggleUserInfo} style={profileImgLinkStyle}>
        <img src={profileImg} alt="Profile" style={profileImgStyle} />
      </div>

      {(showUserInfo && userInfo) && (
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

      {notLoggedIn && (
        <div style={userInfoBoxStyle} ref={userInfoRef}>
          <strong>You are not logged in. </strong>
          <div style={{ marginTop: "10px" }}>
            Redirecting to login page...
          </div>
        </div>
      )}

      <Link href="/" style={siteNameStyle}>Tuneflix</Link>
      <div style={{
        position: "absolute",
        top: "10px",
        right: "70px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}>
        <div style={{ position: "relative" }}>
          <FontAwesomeIcon
            icon={faSearch}
            style={{
              position: "absolute",
              left: "10px",
              top: "40%",
              transform: "translateY(-50%)",
              color: "#aaa",
              pointerEvents: "none",
              fontSize: "1rem",
            }}
          />
          <textarea
            rows="1"
            placeholder="Search songs..."
            value={search}
            onChange={handleSearchChange}
            style={{
              padding: "8px 8px 8px 32px",
              borderRadius: "20px",
              border: "1px solid #444",
              backgroundColor: "#222",
              color: "white",
              resize: "none",
              fontSize: "1rem",
              outline: "none",
              width: "220px",
            }}
          />
        </div>
        {results.length > 0 && (
          <div style={{
            position: "fixed",
            top: "60px",
            left: 0,
            width: "100%",
            height: "80%",
            backgroundColor: "#111",
            zIndex: 1002,
            overflowY: "auto",
            padding: "20px",
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
                }}>
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
