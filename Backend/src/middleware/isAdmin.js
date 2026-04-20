const { jsonResponse } = require("../conexion/jsonResponse");

function isAdmin(req, res, next) {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json(
      jsonResponse(403, {
        error: "Access denied. Administrator permissions are required.",
      }),
    );
  }
}

module.exports = isAdmin;
