const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const adminAuth = require('../middleware/adminAuth');
const { connect } = require("mongodb");

//ADMIN: UPDATE ANY PROFILE
router.patch("/users/:user", adminAuth, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const user = await User.findOne({ email: req.params.user.toLowerCase() });

    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();
    // const user = await User.findOneAndUpdate({ last_name: req.params.user.toLowerCase() }, req.body, { new: true, runValidators: true });

    if (!user) {
      res.status(404).send("User not found");
    }

    res.send(user);
  } catch (error) {
    return res.status(500).send();
  }
});

//ADMIN: DELETE ANY PROFILE
router.delete("/users/:userEmail", adminAuth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.userEmail.toLowerCase() });

    if (!user) {
      return res.status(404).send("user not found");
    }
    console.log("Deleted User:", `${user.first_name} ${user.last_name}`);
    res.send({ Deleted: user.first_name + " " + user.last_name });
  } catch (error) {
    res.status(500).send();
  }
});

//ADMIN: GET ANY USER
router.get("/users/:userEmail", adminAuth, async (req, res) => {
  const _user = req.params.userEmail.toLowerCase();

  try {
    const user = await User.findOne({ email: _user });
    res.send(user);

    if (!user) {
      return res.status(404).send("No User Found").send(unit);
    }

    res.status(201).send(user);
  } catch (error) {
    res.status(500).send();
  }
});

//ADMIN: GET ALL USERS
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router