import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({ maxFileSize: 100 * 1024 * 1024 }); // 100MB

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(400).json({ message: "File upload error" });
    }

    const file = files.file;
    const fileName = fields.fileName;

    if (!file || !fileName) {
      return res.status(400).json({ message: "Missing file or fileName" });
    }

    try {
      const fs = await import("fs/promises");
      const fileBuffer = await fs.readFile(file.filepath);
      const fileContent = fileBuffer.toString("base64");

      const { Octokit } = await import("@octokit/rest");
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });

      const owner = "CodeNova5";
      const repo = "Music-Backend";
      const path = `public/comment/${fileName}`;

      let sha;
      try {
        const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
        sha = data.sha;
      } catch {
        // File does not exist, will be created
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
        path: `https://raw.githubusercontent.com/CodeNova5/Music-Backend/refs/heads/main/public/comment/${fileName}`,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      return res.status(500).json({ message: error.message });
    }
  });
}
