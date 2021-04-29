const express = require("express");
const router = new express.Router();
const User = require("../db/models/user");

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.status(201).send(console.log("Added new User", user));
  } catch (error) {
    res.status(400).send(error);
  }
});


router.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/users/:user", async (req, res) => {
  const _user = req.params.user.toLowerCase();
  console.log(_user)

  try {
    const user = await User.findOne({ last_name: _user, });
    console.log(`Fetching User: ${user}`)
    res.send(user)

    if (!user) {
      return res.status(404).send("No User Found").send(unit);
    }

    res.status(201).send(user);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/users/:user", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ last_name: req.params.user.toLowerCase() }, req.body, { new: true, runValidators: true });

    if (!user) {
      res.status(404).send("User not found");
    }

    res.send(user);
  } catch (error) {
    return res.status(500).send();
  }
});

router.delete("/users/:user", async (req, res) => {
  console.log( req.params.user.toLowerCase());
  try {
    const user = await User.findOneAndDelete({ last_name: req.params.user.toLowerCase() });
    console.log(user);

    if (!user) {
      return res.status(404).send("user not found");
    }
    console.log("Deleted User:", user)
    res.send({ Deleted: _user.name });
  } catch (error) {
    res.status(500).send();
  }
});



module.exports = router;
