const jwt = require("jsonwebtoken");
const JWT_ACCESS_TOKEN_SECRET = "LFSLDJK";

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res
      .status(401)
      .send({ message: "Unauthorized! No Token Found" });


  try {
    const user = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);
    req.user = user;
    console.log(user)
    next();
  } catch (err) {
    console.log("Invalid Token ", err.message);
    return res.status(403).send({ message: err.message });
  }
}

module.exports = {
  authenticate
}