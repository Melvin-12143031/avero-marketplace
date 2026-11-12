const authorizeRoles = (...AllowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !AllowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
};

export default authorizeRoles;
