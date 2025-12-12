const requireRole = (requiredRole) => {
    return (req, res, next) => {
        try {
            const userRole = req.user.role;

            if (userRole !== requiredRole) {
                return res.status(403).json({ message: "You are not authorized" });
            }
            next();
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };
};


module.exports = { requireRole };
