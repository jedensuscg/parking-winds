const { compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  let token;
  console.log(req.originalUrl);

  if (req.originalUrl != "/") {
    try {
      token = req.cookies.token;
      //token = req.header("Authorization").replace("Bearer ", ""); //Gets token of req header

      user = await decodeAndGetUser(token)
      // const decoded = jwt.verify(token, "thisismynewcourse"); // Verifies it
      // const user = await User.findOne({ _id: decoded._id, "tokens.token": token }); //Verifies token still exists in user token array. If not user has logged out.
      
      if (!user) {
        throw new Error("Please Authenticate");
      }

      req.token = token;
      req.user = user; //Add the user data to the req, so we don't have to do another DB query
      next();

    } catch (error) {
      res.status(401).send({ error: error.message });
    }
  } else {
    if (req.cookies.token) {
      token = req.cookies.token;
      const user = await decodeAndGetUser
      if (!user) {
        console.log("user not logged in");
      } else {
        req.token = token;
        req.user = user; //Add the user data to the req, so we don't have to do another DB query
        console.log("User already logged in");
      }
    } else {
      console.log("User not logged in")
    }
    next();
  }
};

const decodeAndGetUser = async (token) => {
      const decoded = jwt.verify(token, "thisismynewcourse"); // Verifies it
      return user = User.findOne({ _id: decoded._id, "tokens.token": token }); //Verifies token still exists in user token array. If not user has logged out.
}

module.exports = auth;
