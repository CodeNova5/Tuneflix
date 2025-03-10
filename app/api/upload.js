// pages/api/uploadImage.js

import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  // Expecting JSON payload with the following properties:
  // - fileName: The name (with extension) of the file (e.g., "myImage.png")
  // - fileContent: The Base64 encoded string of the image content (without the data prefix)
  const { fileName, fileContent } = req.body;

  if (!fileName || !fileContent) {
    return res.status(400).json({ message: 'Missing fileName or fileContent in request body' });
  }

  try {
    // Initialize Octokit with your GitHub token stored in environment variables.
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN, // Set this in your .env file
    });

    // Configure these values for your GitHub repository.
    const owner = 'Netdot12'; // Replace with your GitHub username or organization
    const repo = 'next'; // Replace with your repository name
    const path = `images/${fileName}`; // You can change the path as needed

    // Check if the file already exists to update it; if not, we will create it.
    let sha;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });
      sha = data.sha;
    } catch (error) {
      // If the file does not exist, getContent will throw an error.
      console.log('File does not exist and will be created.');
    }

    // Create a commit message
    const commitMessage = sha ? 'Update image file' : 'Add new image file';

    // Create or update the file on GitHub
    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: commitMessage,
      content: fileContent, // this must be a Base64 encoded string
      sha: sha, // if updating, include the current sha
    });

    return res.status(200).json({
      message: 'Image uploaded successfully',
      data: response.data,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ message: error.message });
  }
}
