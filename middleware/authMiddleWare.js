// TODO: Implement authentication middleware
const authMiddleware = (req, res, next) => {
    // JWT verification logic here
    next();
};

const adminMiddleware = (req, res, next) => {
    // Admin check logic here
    next();
};

module.exports = { authMiddleware, adminMiddleware };