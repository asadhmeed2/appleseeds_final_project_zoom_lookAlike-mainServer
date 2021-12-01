const jwt = require("jsonwebtoken");
/**
 * 
 * @param {*} req 
 * @param {*} role 
 * @returns 
 */
function createTokens(req,role,uniqid) {
 const {userName} =req.body;
  const accessToken = jwt.sign(
    { userName:userName,role:role,uniqid:uniqid},
    process.env.ACCESS_TOKEN_SECRET
  );
  const refreshToken = jwt.sign(
    {userName:userName,role:role,uniqid:uniqid},
    process.env.REFRESH_TOKEN_SECRET
    );
  return { accessToken:accessToken, refreshToken:refreshToken };
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
function authenticateToken(req, res, next) {
    
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; 
    //     \/
    // bearer TOKEN
    if (token == null) {
      return res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send("");
      }
      req.user = decoded;
      next();
    });
  }
function adminTokenAuth(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; 
    //     \/
    // bearer TOKEN
    if (token == null) {
      return res.sendStatus(401);
    }
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send("");
      }
      if(decoded.role !== "admin"){
        return res.status(403).json({msg:"not authorized"});
      }
      req.user = decoded;
      next();
    });
  }

function createAccessToken(user){
  return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'24h'});
}


  module.exports={
    createTokens,
    authenticateToken,
    createAccessToken,
    adminTokenAuth
  }

