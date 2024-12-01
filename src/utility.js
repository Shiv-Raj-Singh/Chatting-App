import jwt from "jsonwebtoken";

/**
 * @name generateJwtToken
 * @description Generates a JWT token for the user with their ID and email.
 * @param {string} userId - The user's unique ID.
 * @param {string} email - The user's email.
 * @returns {string} - The generated JWT token.
 */
export const generateJwtToken = (Object) => {
  return jwt.sign(
    Object, // Payload (user's ID and email)
    process.env.JWT_TOKEN_SECRET_KEY, // Secret key from environment variables
    { expiresIn: "1h" } // Token expiration time (1 hour)
  );
};

/**
 * @name verifyJwtToken
 * @description Verifies a given JWT token and decodes the payload if valid.
 * @param {string} token - The JWT token to be verified.
 * @returns {object | null} - Decoded payload if token is valid, null otherwise.
 */
export const verifyJwtToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY); // Verify the token with the secret
    return decoded; // Return the decoded payload
  } catch (error) {
    return null; // If token is invalid, return null
  }
};
