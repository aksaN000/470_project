// Admin authorization middleware
// This middleware checks if the authenticated user has admin privileges

const adminAuth = (req, res, next) => {
    try {
        // Check if user is authenticated (auth middleware should run first)
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied. Admin privileges required.',
                userRole: req.user.role 
            });
        }

        // User is admin, proceed to next middleware
        next();
    } catch (error) {
        res.status(500).json({ 
            message: 'Server error in admin authorization',
            error: error.message 
        });
    }
};

module.exports = adminAuth;
