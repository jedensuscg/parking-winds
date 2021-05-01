const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require('../middleware/auth');
const { connect } = require("mongodb");

//Create new user
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    const token = await user.generateAuthToken()
    await user.save();
    res.status(201).send({user, token});
  } catch (error) {
    res.status(400).send(error);
  }
});

//User Login Route
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken()
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({error: error.message});
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token
    })

    await req.user.save()

    res.send()
  } catch (error) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []

    await req.user.save()

    res.send()
  } catch (error) {
    res.status(500).send()
  }
})

//Get ALL users. Requires Admin access
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user)
});

router.get("/users/:user", async (req, res) => {
  const _user = req.params.user.toLowerCase();

  try {
    const user = await User.findOne({ email: _user });
    console.log(`Fetching User: ${user}`);
    res.send(user);

    if (!user) {
      return res.status(404).send("No User Found").send(unit);
    }

    res.status(201).send(user);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/users/:user", async (req, res) => {
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




router.delete("/users/:user", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.user.toLowerCase() });

    if (!user) {
      return res.status(404).send("user not found");
    }
    console.log("Deleted User:", `${user.first_name} ${user.last_name}`);
    res.send({ Deleted: user.first_name + " " + user.last_name });
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
