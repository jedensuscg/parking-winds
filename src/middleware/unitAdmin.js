const jwt = require("jsonwebtoken")
const User = require("../models/user")
const Unit = require("../models/unit");
const { create } = require("../models/user");

const unitAdmin = async(req, res, next) => {
  let token;
  try {

    try {
      token = req.header('Authorization').replace('Bearer ','') //Gets token of req header
    } catch (error) {
      throw new Error('Please Authenticate')
    }
    
    const decoded = jwt.verify(token, 'thisismynewcourse') // Verifies it
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token }) //Verifies token still exists in user token array. If not user has logged out.

    if (!user) {
      throw new Error("Please Authenticate")
    }

    if (req.method === "POST") {
      console.log(user.unitAdminPermissions[0].create)
      if (!user.unitAdminPermissions[0].create) {
        throw new Error("Invalid Permission to access this route.")
      }
    }

    if (req.method === "PATCH") {
      console.log(user.unitAdminPermissions[1].patch)
      if (!user.unitAdminPermissions[1].patch) {
        throw new Error("Invalid Permission to access this route.")
      }
    }

    if (req.method === "DELETE") {
      console.log(user.unitAdminPermissions[2].delete)
      if (!user.unitAdminPermissions[2].delete) {
        throw new Error("Invalid Permission to access this route.")
      }
    }
    

    req.token = token
    req.user = user //Add the user data to the req, so we don't have to do another DB query
    next()
  } catch (error) {
    res.status(401).send({error: error.message})
  }
}

module.exports = unitAdmin