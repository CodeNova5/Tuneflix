export default async function handler(req, res) {
  
  const { fileName, fileContent } = req.body;

  if (!fileName || !fileContent) {
    return res.status(400).json({ message: 'Missing fileName or fileContent in request body' });
  }

  try {
    // Dynamically import Octokit (ESM)
    const { Octokit } = await import('@octokit/rest');

    // Initialize Octokit with GitHub token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN, // Ensure this is set in .env.local
    });

    const owner = 'Netdot12';
    const repo = 'next';
    const path = `public/comment/${fileName}`;

    let sha;
    try {
      const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
      sha = data.sha;
    } catch (error) {
      console.log('File does not exist and will be created.');
    }

    const commitMessage = sha ? 'Update file' : 'Add new file';

    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: commitMessage,
      content: fileContent,
      sha,
    });

    return res.status(200).json({
      message: 'File uploaded successfully',
      data: response.data,
      path: `/comment/${fileName}`,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ message: error.message });
  }
}
