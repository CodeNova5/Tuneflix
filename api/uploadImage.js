import { Octokit } from '@octokit/rest';
import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false, // Disable built-in body parser (Formidable will handle it)
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      // Read the file as a buffer
      const fileBuffer = await fs.readFile(file.filepath);
      const fileContent = fileBuffer.toString('base64'); // Convert binary data to Base64

      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN, // Ensure it's set in .env.local
      });

      const owner = 'Netdot12';
      const repo = 'next';
      const path = `images/${file.originalFilename}`;

      let sha;
      try {
        const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
        sha = data.sha;
      } catch (error) {
        console.log('File does not exist and will be created.');
      }

      const commitMessage = sha ? 'Update image file' : 'Add new image file';

      const response = await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: commitMessage,
        content: fileContent,
        sha,
      });

      return res.status(200).json({
        message: 'Image uploaded successfully',
        data: response.data,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ message: error.message });
    }
  });
}
