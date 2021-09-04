const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "First Name required!"],
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isAlpha(value)) {
        throw new Error("Invalid First Name. No numbers!");
      }
    },
  },
  last_name: {
    type: String,
    required: [true, "Last Name required!"],
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isAlpha(value)) {
        throw new Error("Invalid First Name. No numbers!");
      }
    },
  },
  unit: {
    type: String,
    required: [true, "Unit Name Required"],
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "You must enter an email."],
    unique: [true],
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email!");
      }
    },
  },
  dbAccess: {
    type: String,
    required: true,
    default: "user",
  },
  unitAdminPermissions:{
    type: Array,
    default: [
      {create: false},
      {patch: false},
      {delete: false}
    ]
  },
  password: {
    type: String,
    required: [true, "You must enter a password"],
    minLength: [7, "Password must be greater than 6 characters"],
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error('Password must not include the word "password"');
      }
    },
    trim: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  adminUnits: [
    {
      type: mongoose.Schema.Types.ObjectId,
    }
  ]
});

//puts method on instance of User
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "thisismynewcourse");

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens

  return userObject;

}

//Puts method on Model(Model Method)
userSchema.statics.findByCredentials = async (email, password) => {

  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error("Unable to login");
  }
  

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to  pass login");
  }

  return user;
};

// Hash Plaintext password before saving
userSchema.pre("save", async function (next) {
  const user = this;
  
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
