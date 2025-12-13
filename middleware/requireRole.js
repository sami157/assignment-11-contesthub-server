const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role;

            const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            if (!rolesArray.includes(userRole)) {
                return res.status(403).json({ message: "You are not authorized" });
            }

            next();
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };
};

module.exports = { requireRole };
