function permitRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ error: "User not authenticated" });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = permitRoles;
