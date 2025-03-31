import ytdlp from "yt-dlp-exec";

const url = "https://www.youtube.com/watch?v=qdpXxGPqW-Y";
const output = "downloaded_audio.mp3";

ytdlp(url, {
    extractAudio: true,
    audioFormat: "mp3",
    limitRate: "2M",
    output: output,
})
.then(() => console.log("Audio download complete!"))
.catch((error) => console.error("Error:", error));
