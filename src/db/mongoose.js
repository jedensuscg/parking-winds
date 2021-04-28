const mongoose = require("mongoose");

const MONGO_USERNAME = "jedens";
const MONGO_PASSWORD = "Ferr!s201";
console.log("attempting to connect to database")
mongoose.connect("mongodb://127.0.0.1:27017/parking-winds-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}).then(() => {
  console.log("connected to database")
})
