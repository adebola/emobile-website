const admin = require('firebase-admin');

/**
 * Verify Firebase Authentication Token
 *
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Returns the decoded token containing user information.
 *
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Decoded token with user info { uid, email, etc. }
 * @throws {Error} If token is missing or invalid
 */
async function verifyAuth(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized - No token provided');
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken; // Returns { uid, email, etc. }
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Unauthorized - Invalid token');
  }
}

module.exports = { verifyAuth };
