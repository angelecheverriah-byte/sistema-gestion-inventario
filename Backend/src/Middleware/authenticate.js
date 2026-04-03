const jwt = require("jsonwebtoken");
const { jsonResponse } = require("../conexion/jsonResponse");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json(jsonResponse(401, { error: "No token provided" }));
  }

  // El header suele venir como "Bearer TOKEN_AQUÍ"
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(jsonResponse(401, { error: "Invalid or expired token" }));
  }
}

module.exports = authenticate;
