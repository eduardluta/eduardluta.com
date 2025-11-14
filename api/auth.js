// GitHub OAuth handler for Decap CMS
// Deploy this to Vercel, Netlify, or similar serverless platform
//
// Setup instructions:
// 1. Create a GitHub OAuth App at https://github.com/settings/developers
//    - Application name: Eduard Luta CMS
//    - Homepage URL: https://eduardluta.com
//    - Authorization callback URL: https://eduardluta.com/api/callback
//
// 2. Copy the Client ID and Client Secret
//
// 3. Deploy this to Vercel:
//    - Install Vercel CLI: npm i -g vercel
//    - Run: vercel
//    - Set environment variables:
//      - OAUTH_CLIENT_ID=your_github_client_id
//      - OAUTH_CLIENT_SECRET=your_github_client_secret
//
// 4. Update admin/config.yml with your Vercel URL:
//    base_url: https://your-project.vercel.app
//    auth_endpoint: /api/auth

const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }

  try {
    // Exchange code for access token
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json(data);
    }

    // Return the token in the format Decap CMS expects
    res.status(200).send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify({ token: data.access_token })}',
                window.location.origin
              );
              window.close();
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
