export const roleBasedRoutes = (...allowedRoles) => {
    return (req, res, next) => {
        const userRoles = req.user.userRoles;
        const hasRole = userRoles.some(role => allowedRoles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};