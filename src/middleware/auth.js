const { compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  let token;

  try {
    token = req.header("Authorization").replace("Bearer ", ""); //Gets token of req header

    const decoded = jwt.verify(token, "thisismynewcourse"); // Verifies it
    
    const user = await User.findOne({ _id: decoded._id, "tokens.token": token }); //Verifies token still exists in user token array. If not user has logged out.

    if (!user) {
      throw new Error("Please Authenticate");
    }

    req.token = token;
    req.user = user; //Add the user data to the req, so we don't have to do another DB query
    next();
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
};

module.exports = auth;
