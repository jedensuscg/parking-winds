const express = require("express");
const router = new express.Router();
const cookieParser = require('cookie-parser');
const User = require("../models/user");
const Unit = require("../models/unit")
const auth = require('../middleware/auth');
const { connect } = require("mongodb");
const { response } = require("express");


// Parsers for POST data
router.use(express.json({limit: '20mb'}));
router.use(express.urlencoded({ extended: false, limit: '20mb' }));
router.use(cookieParser())
//CREATE NEW USER
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    const token = await user.generateAuthToken()
    const unit = await Unit.findOne( {unitName: req.body.unit.toLowerCase() } )
    user.adminUnits.push(unit._id)
    await user.save();
    res.status(201).send({user, token});
  } catch (error) {
    res.status(400).send(error);
  }
});

//LOGIN USER
router.post("/users/login",  async (req, res) => {

 
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken()
    res.cookie('token', token,
    {
      maxAge: 604800016,
      secure: true,
      httpOnly: true,
      sameSite: 'lax'

    })
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({error: error.message});
  }
});

//LOGOUT USER
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

//LOGOUT USER ALL LOCATIONS
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []

    await req.user.save()

    res.send()
  } catch (error) {
    res.status(500).send()
  }
})

//GET OWN PROFILE
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user)
});

//UPDATE OWN PROFILE
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['first_name', 'last_name', 'email', 'password', 'unit']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid Update '})
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();
    // const user = await User.findOneAndUpdate({ last_name: req.params.user.toLowerCase() }, req.body, { new: true, runValidators: true });

    res.send(req.user);
  } catch (error) {
    return res.status(400).send(error);
  }
});

//DELETE OWN PROFILE
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove()

    console.log("Deleted User:", `${req.user.first_name} ${req.user.last_name}`);
    
    res.send({ Deleted: req.user });
  } catch (error) {
    res.status(500).send();
  }
});




module.exports = router;
