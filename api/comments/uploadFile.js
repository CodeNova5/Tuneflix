import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Disables Next.js's default body parser
  },
};

export default async function handler(req, res) {

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "Error parsing form data" });
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    const uploadedFileName = Array.isArray(fields.fileName) ? fields.fileName[0] : fields.fileName;

    if (!uploadedFile || !uploadedFileName) {
      return res.status(400).json({ message: "Missing file or fileName" });
    }

    try {
      const fileBuffer = await fs.promises.readFile(uploadedFile.filepath);
      const fileContent = fileBuffer.toString("base64");

      // GitHub upload code continues here...

      // Dynamically import Octokit (ESM)
      const { Octokit } = await import("@octokit/rest");

      // Initialize Octokit with GitHub token
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });

      const owner = "CodeNova5";
      const repo = "Music-Backend";
      const path = `public/comment/${uploadedFileName}`;

      let sha;
      try {
        const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
        sha = data.sha;
      } catch (error) {
        console.log("File does not exist and will be created.");
      }

      const commitMessage = sha ? "Update file" : "Add new file";

      const response = await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: commitMessage,
        content: fileContent,
        sha,
      });

      return res.status(200).json({
        message: "File uploaded successfully",
        data: response.data,
        path: `https://raw.githubusercontent.com/CodeNova5/Music-Backend/main/public/comment/${uploadedFileName}`,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      return res.status(500).json({ message: error.message });
    }
  });
}
