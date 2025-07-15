"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ID3Writer } from 'browser-id3-writer';
import CommentShareModule from '@/components/CommentShareModule'
import Header from '@/components/Header'
import Footer from "@/components/Footer";
import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer from 'react-h5-audio-player';
import './audioPlayerStyles.css';

interface Track {
    name: string;
    artists: { name: string }[];
    album: {
        name: string;
        images: { url: string }[];
        release_date: string;
        type: string;
    };
    preview_url: string | null;
    duration_ms: number;
}

export default function SongPage() {
    const { artist, song } = useParams() as { artist: string; song: string };
    const [track, setTrack] = React.useState<Track | null>(null);
    const [videoId, setVideoId] = React.useState<string | null>(null);
    const [lyricsVideoId, setLyricsVideoId] = React.useState<string | null>(null);
    const [songs, setSongs] = React.useState<any[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [isUploading, setIsUploading] = React.useState<boolean>(false);
    const [modalMessage, setModalMessage] = React.useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
    const [showSelect, setShowSelect] = React.useState(false);
    const [lyricsHtml, setLyricsHtml] = React.useState<string>("Loading lyrics...");
    const [relatedSongs, setRelatedSongs] = React.useState<any[]>([]);
    const router = useRouter();
    // Google/Facebook scripts (browser-only)
    React.useEffect(() => {
        // Google script
        const googleScript = document.createElement('script');
        googleScript.src = 'https://accounts.google.com/gsi/client';
        googleScript.async = true;
        googleScript.defer = true;
        document.body.appendChild(googleScript);

        window.handleCredentialResponse = (response: any) => {
            if (response.credential) {
                const data = parseJwt(response.credential);
                saveUserInfo('google', data);
            } else {
                console.error("Error: No Google credential received.");
            }
        };

        window.onload = () => {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo) {
                window.google?.accounts.id.initialize({
                    client_id: '847644538886-h57vcktcmjhdlj553b33js8tnenlge62',
                    callback: window.handleCredentialResponse,
                    cancel_on_tap_outside: false,
                });
                window.google?.accounts.id.prompt();
            }
        };

        function saveUserInfo(provider: string, data: any) {
            localStorage.setItem('userInfo', JSON.stringify({ provider, data }));
        }
        function parseJwt(token: string) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        }

        return () => {
            document.body.removeChild(googleScript);
        };
    }, []);

    // Disable background scroll when modal is open
    React.useEffect(() => {
        if (modalMessage) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [modalMessage]);

    // Fetch main track and related data
    React.useEffect(() => {
        if (!artist || !song) return;
        setError(null);
        setTrack(null);
        setVideoId(null);
        setLyricsVideoId(null);
        setDownloadUrl(null);
        setLyricsHtml("Loading lyrics...");
        setSongs([]);

        async function fetchData() {
            try {
                // Fetch song details
                const response = await fetch(
                    `/api/Music/route?type=songDetails&artistName=${encodeURIComponent(artist)}&songName=${encodeURIComponent(song)}`
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    setError(errorData.error || "Failed to fetch song details");
                    return;
                }
                const trackData = await response.json();
                setTrack(trackData);

                // Fetch YouTube video
                const videoResponse = await fetch(
                    `/api/Music/route?type=youtubeMusicVideo&artistName=${encodeURIComponent(artist)}&songName=${encodeURIComponent(song)}`
                );
                const videoData = await videoResponse.json();
                if (videoData.videoId) setVideoId(videoData.videoId);

                // Fetch lyrics video
                const lyricsVideoResponse = await fetch(
                    `/api/Music/route?type=lyricsVideo&artistName=${encodeURIComponent(artist)}&songName=${encodeURIComponent(song)}`
                );
                const lyricsVideoData = await lyricsVideoResponse.json();
                if (lyricsVideoData.videoId) setLyricsVideoId(lyricsVideoData.videoId);

                // Fetch and display lyrics
                fetchAndDisplayLyrics(artist, song);

                // Fetch related songs
                fetchSongs(song);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError("An unexpected error occurred");
            }
        }
        fetchData();
        // eslint-disable-next-line
    }, [artist, song]);

    // Fetch and format lyrics
    async function fetchAndDisplayLyrics(artistName: string, songName: string) {
        try {
            const response = await fetch(
                `/api/Music/route?type=lyrics&artistName=${encodeURIComponent(artistName)}&songName=${encodeURIComponent(songName)}`
            );
            if (!response.ok) throw new Error("Failed to fetch lyrics");
            const data = await response.json();
            if (data.lyrics) {
                setLyricsHtml(formatLyrics(data.lyrics));
            } else {
                setLyricsHtml("Lyrics not found.");
            }
        } catch (error) {
            setLyricsHtml("Failed to load lyrics.");
        }
    }

    function formatLyrics(lyrics: string) {
        return lyrics
            .replace(/(.*?)/g, '<div class="lyrics-section"><strong>[$1]</strong></div>')
            .replace(/\n/g, "<br>");
    }
    React.useEffect(() => {
        async function fetchRelatedTracks() {
            try {
                const response = await fetch(
                    `/api/Music/route?type=relatedTracks&artistName=${encodeURIComponent(artist)}&songName=${encodeURIComponent(song)}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch related tracks");
                }

                const relatedTracks = await response.json();
                console.log("Related Tracks:", relatedTracks);
                setRelatedSongs(relatedTracks);
            } catch (err) {
                console.error("Error fetching related tracks:", err);
            }
        }
    }, [artist, song]);
    
    // Fetch songs
    async function fetchSongs(songName: string) {
        try {
            const response = await fetch(
                `/api/Music/route?type=artistSongs&artistName=${encodeURIComponent(artist)}`
            );
            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || "Failed to fetch songs");
                return;
            }
            const songsData = await response.json();
            // Filter out duplicates and the current song
            const filteredSongs = songsData
                .filter(
                    (song: any, index: number, self: any[]) =>
                        song.name.toLowerCase() !== songName.toLowerCase() &&
                        self.findIndex((s) => s.name.toLowerCase() === song.name.toLowerCase()) === index
                );
            setSongs(filteredSongs);
        } catch (err) {
            setError("An unexpected error occurred");
        }
    }



    // Add this helper to check GitHub for the file
    async function checkGithubFileExists(fileName: string): Promise<string | null> {
        const artistName = track?.artists[0]?.name || "Unknown Artist";
        const githubRawUrl = `https://raw.githubusercontent.com/CodeNova5/Music-Backend/main/public/music/${artistName}/${fileName}`;
        try {
            const res = await fetch(githubRawUrl, { method: "HEAD" });
            if (res.ok) {
                return githubRawUrl;
            }
            return null;
        } catch {
            return null;
        }
    }

    // Add this helper to upload using FormData (for formidable)
    async function uploadFileToGithub(artistName: string, fileName: string, blob: Blob) {
        const formData = new FormData();
        formData.append("file", blob, fileName);
        formData.append("fileName", fileName);
        formData.append("artistName", artistName);
        await fetch("/api/comments/uploadFile?type=music", {
            method: "POST",
            body: formData,
        });
    }
    // Replace your useEffect for MP3 conversion and download with this:
    React.useEffect(() => {
        async function processAudio() {
            if (!lyricsVideoId || !track) return;

            const formatTitle = (title: string): string =>
                title
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join("-");

            const fileName = `${formatTitle(track.artists[0]?.name ?? "")}_-_${formatTitle(track.name ?? "")}.mp3`;
            // 1. Check if file exists in GitHub
            const githubUrl = await checkGithubFileExists(fileName);
            if (githubUrl) {
                setDownloadUrl(githubUrl);
                return;
            }



            setIsUploading(true);

            try {
                const response = await fetch(
                    `https://video-downloader-server.fly.dev/download?url=https://www.youtube.com/watch?v=${lyricsVideoId}&type=audio`
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    setModalMessage(errorData.error || "Failed to convert video to MP3");
                    setIsUploading(false);
                    return;
                }
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();

                // Add metadata using browser-id3-writer
                const writer = new ID3Writer(arrayBuffer);
                writer.setFrame('TIT2', track.name ?? 'Unknown Title')
                    .setFrame('TPE1', [track.artists[0]?.name ?? "Unknown Artist"])
                    .setFrame('TALB', track.album?.name ?? "Unknown Album");
                const coverImageUrl = track.album?.images[0]?.url;
                if (coverImageUrl) {
                    const coverResponse = await fetch(coverImageUrl);
                    const coverBlob = await coverResponse.blob();
                    const coverArrayBuffer = await coverBlob.arrayBuffer();
                    (writer as any).setFrame('APIC', {
                        type: 3,
                        data: new Uint8Array(coverArrayBuffer),
                        description: 'Cover',
                    });
                }
                writer.addTag();
                const taggedBlob = writer.getBlob();
                const url = window.URL.createObjectURL(taggedBlob);

                const a = document.createElement("a");
                a.id = "download-link";
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);

                document.body.removeChild(a);
                setDownloadUrl(url);

                // Upload to GitHub using FormData (for formidable)
                const artistName = track.artists[0]?.name || "Unknown Artist";
                await uploadFileToGithub(artistName, fileName, taggedBlob);

                // After upload, check again and set download URL


                setIsUploading(false);
            } catch (err) {
                setModalMessage("An unexpected error occurred");
                setTimeout(() => setModalMessage(null), 2000);
                setIsUploading(false);
            }
        }

        if (lyricsVideoId && track && !downloadUrl) {
            processAudio();
        }
        // eslint-disable-next-line
    }, [lyricsVideoId, track]);


    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const artistName = e.target.value;
        if (artistName) {
            router.push(`/music/${encodeURIComponent(artistName)}`);
        }
    };
    // Remove the invalid useEffect and handle "song not found" in the render logic below.
    const decodedArtist = decodeURIComponent(artist);
    const songNotFound =
        track &&
        decodedArtist &&
        !track.artists?.some((a: any) =>
            a.name?.toLowerCase() === decodedArtist.toLowerCase()
        );

    if (songNotFound) {
        return (
            <div style={{ textAlign: "center", marginTop: "60px", color: "#fff" }}>
                <h1>Song not found</h1>
                <p>
                    The song you are looking for does not exist for this artist.
                </p>
                <Link href="/" style={{
                    color: "#1db954",
                    textDecoration: "underline",
                    fontWeight: "bold",
                    fontSize: "18px"
                }}>
                    Return to homepage
                </Link>
            </div>
        );
    }
    if (!track) return <h1>Loading...</h1>;

    return (
        <div style={{ textAlign: "center", backgroundColor: "#111", padding: "20px", marginTop: "40px" }}>
            <Header />
            <div style={{ fontSize: "25px", fontWeight: "bold" }}>
                <h1>{track.name} by </h1>
                <h2>
                    {track.artists.map((a) => a.name).join(", ")}
                </h2>
            </div>
            <img src={track.album.images[0]?.url || "/placeholder.jpg"} alt={track.name} width="300" />

            {/* Song Details Table */}
            <table style={{ margin: "20px auto", borderCollapse: "collapse", width: "80%" }}>
                <tbody>
                    <tr>
                        <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Detail</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Value</th>
                    </tr>
                    <tr>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>Artist(s)</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                            {track.artists.map((a) => a.name).join(", ")}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>Album</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>{track.album.name}</td>
                    </tr>
                    <tr>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>Duration</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                            {track.duration_ms
                                ? `${Math.floor(track.duration_ms / 60000)}:${(
                                    (track.duration_ms % 60000) /
                                    1000
                                )
                                    .toFixed(0)
                                    .padStart(2, "0")}`
                                : "N/A"}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>Release Date</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                            {track.album.release_date || "N/A"}
                        </td>
                    </tr>
                </tbody>
            </table>
            <div style={{ marginTop: "20px" }}>
                {track.artists.length > 1 ? (
                    <div>
                        {!showSelect ? (
                            <button
                                onClick={() => setShowSelect(true)}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#1db954',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                View Artists
                            </button>
                        ) : (
                            <select
                                onChange={handleSelect}
                                defaultValue=""
                                style={{
                                    backgroundColor: '#1e1e1e',
                                    color: '#fff',
                                    marginTop: '10px',
                                    padding: '8px',
                                    fontSize: '14px',
                                    borderRadius: '4px',
                                }}
                            >
                                <option value="" disabled>Select an artist</option>
                                {track.artists.map((artist, index) => (
                                    <option key={index} value={artist.name}>
                                        {artist.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                ) : (
                    <Link href={`/music/${encodeURIComponent(track.artists[0].name)}`}>
                        <h3 style={{ fontSize: "16px", margin: "10px 0" }}>View Artist</h3>
                    </Link>
                )}
            </div>
            <div id="youtube-video" style={{ marginTop: "20px" }}>
                {videoId ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        allowFullScreen
                        height="315"
                        style={{ width: "90%" }}
                    ></iframe>
                ) : (
                    <p>No video available for this song.</p>
                )}
            </div>
            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <h3 style={{ fontSize: "25px", margin: "10px 0" }}>Listen to the song</h3>
                {!downloadUrl ? (
                    <p>Preparing audio, please wait...</p>
                ) : (
                    <AudioPlayer
                        src={downloadUrl}
                        style={{ marginTop: "20px" }}
                    />
                )}
            </div>
            <a
                onClick={async (e) => {
                    // Ensure the filename does not have "public_comment" attached to it
                    const cleanFileName = `${track.artists[0]?.name.replace(/ /g, "-")}_-_${track.name.replace(/ /g, "-")}.mp3`;

                    if (!downloadUrl) {
                        e.preventDefault();
                        setIsUploading(true);
                        setModalMessage("Preparing download...");
                        const observer = new MutationObserver((mutationsList) => {
                            mutationsList.forEach((mutation) => {
                                if (mutation.type === 'childList') {
                                    mutation.addedNodes.forEach((node) => {
                                        if ((node as HTMLElement).id === 'download-link') {
                                            setModalMessage("✅ Download has started!");
                                            (node as HTMLElement).setAttribute('download', cleanFileName);
                                            (node as HTMLElement).click();
                                            setTimeout(() => {
                                                setModalMessage(null);
                                                setIsUploading(false);
                                            }, 2000);
                                            observer.disconnect();
                                        }
                                    });
                                }
                            });
                        });
                        observer.observe(document.body, { childList: true, subtree: true });
                    }
                    else {
                        setModalMessage("✅ Download has started");
                        setTimeout(() => setModalMessage(null), 2000);
                        setIsUploading(false);
                        const fileUrl = downloadUrl;
                        fetch(fileUrl)
                            .then(response => response.blob())
                            .then(blob => {
                                const link = document.createElement("a");
                                link.href = URL.createObjectURL(blob);
                                link.download = cleanFileName;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            })
                            .catch(console.error);
                    }
                }}
                style={{
                    display: "inline-block",
                    marginTop: "15px",
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    borderRadius: "5px",
                    textDecoration: "none",
                    cursor: "pointer",
                }}
            >
                🎵 Download MP3
            </a>
            {/* Spinner Modal */}
            {modalMessage && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#1e1e1e",
                            padding: "20px",
                            borderRadius: "8px",
                            textAlign: "center",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)",
                            color: "#fff",
                        }}
                    >
                        <p style={{ fontSize: "18px", fontWeight: "bold" }}>{modalMessage}</p>
                    </div>
                </div>
            )}
            <CommentShareModule track={track} album={undefined} artist={undefined} playlist={undefined} />
            {/* Lyrics Section */}
            <div id="lyrics-container" style={{ marginTop: "20px", textAlign: "left" }}>
                <h2 style={{ fontSize: "25px", margin: "10px 0" }} >Lyrics</h2>
                <div dangerouslySetInnerHTML={{ __html: lyricsHtml }} />
            </div>
            <h1>Songs by {track.artists[0]?.name}</h1>
            <div
                style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: "16px",
                    borderRadius: "10px",

                }}
            >
                {songs.map((song, index) => (
                    <div
                        key={index}
                        style={{
                            minWidth: "120px",
                            maxWidth: "120px",
                            background: "#232323",
                            textAlign: "center",
                            border: "1px solid #222",
                            borderRadius: "10px",
                            padding: "10px 8px",
                            boxSizing: "border-box",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                            transition: "transform 0.15s",
                        }}
                    >
                        <Link href={`/music/${encodeURIComponent(song.artists[0]?.name)}/song/${encodeURIComponent(song.name)}`}>
                            <img
                                src={song.album.images[0]?.url || "/placeholder.jpg"}
                                alt={song.name}
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    marginBottom: "8px",
                                    border: "1px solid #333",
                                }}
                            />
                            <h3 style={{
                                fontSize: "13px",
                                margin: "0 0 4px",
                                color: "#fff",
                                fontWeight: 600,
                                overflow: "hidden",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "normal",
                            }}>
                                {song.name}
                            </h3>
                            <p style={{
                                fontSize: "11px",
                                color: "#b3b3b3",
                                margin: 0,
                                overflow: "hidden",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "normal",
                            }}>
                                {song.artists.map((a: any) => a.name).join(", ")}
                            </p>
                        </Link>
                    </div>
                ))}
            </div>
            {/* Related Tracks Section */}
            <h1>Related Tracks</h1>
            <div
                style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: "20px",
                    padding: "10px",
                }}
            >
                {relatedSongs.length > 0 ? (
                    relatedSongs.map((song, index) => (
                        <div
                            key={index}
                            style={{
                                minWidth: "200px",
                                textAlign: "center",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "10px",
                            }}
                        >
                            <Link href={`/music/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.name)}`}>
                                <a style={{ textDecoration: "none", color: "inherit" }}>
                                    <img
                                        src={song.image || "/placeholder.jpg"}
                                        alt={song.name}
                                        style={{ width: "100%", borderRadius: "8px" }}
                                    />
                                    <h3 style={{ fontSize: "16px", margin: "10px 0" }}>{song.name}</h3>
                                    <p style={{ fontSize: "14px", color: "#555" }}>{song.artist}</p>
                                </a>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No related tracks found.</p>
                )}
            </div>
            <Footer />
        </div>
    );
}