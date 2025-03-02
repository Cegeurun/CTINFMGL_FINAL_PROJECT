const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Middleware function to verify user authentication and permissions
 * @param {Object} req - Express request object containing the authorization header
 * @param {Object} res - Express response object for sending responses
 * @param {Function} next - Express middleware callback function
 */
const verifyToken = (req, res, next) => {
    // Extract authorization token from request headers
    const token = req.header('authorization'); 

    // Check if authentication token is missing
    if (!token) {
        return res.status(403).send("Access denied. No token provided.");
    }

    try {
        // Decode and verify JWT token using application secret key
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        // Attach decoded user data to request object for downstream usage
        req.user = decoded;

        // Check if authenticated user has user role
        if (decoded.role === "user") {
            // Grant access to protected routes
            next(); 
        }
    } catch (error) {
        // Handle invalid or expired token errors
        res.status(401).send("Invalid token.");
    }
};

module.exports = verifyToken;
