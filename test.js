import { exec } from "child_process";

const url = "https://www.youtube.com/watch?v=qdpXxGPqW-Y";
const output = "downloaded_audio.mp3";

const command = `yt-dlp -x --audio-format mp3 --limit-rate 2M -o ${output} "${url}"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log("Audio download complete!");
});
