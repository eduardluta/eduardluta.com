// GitHub OAuth callback handler
module.exports = (req, res) => {
  const { code } = req.query;

  // Redirect to the auth endpoint with the code
  res.redirect(307, `/api/auth?code=${code}`);
};
