const express = require("express");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
require("./db/mongoose");
const getTaf = require("./utils/getTaf");
const Unit = require("./db/models/unit");
const unitRouter = require('./routers/unit')
const publicRouter = require('./routers/public')
const userRouter = require('./routers/user')
// const { response } = require("express");




const app = express();
const port = process.env.PORT || 5000;

app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(unitRouter)
app.use(publicRouter)
app.use(userRouter)

const bcrypt = require('bcryptjs')

const password = async () => {
  const password = 'James1234'
  const hashedPassword = await bcrypt.hash(password, 8)

  console.log(password, hashedPassword)

  const isMatch = await bcrypt.compare('James1234', hashedPassword)
  console.log(isMatch)
}
password()


app.get("/taf/:unit", async (req, res) => {
  const _unit = req.params.unit;
  let unit;

  try {
    unit = await Unit.findOne({ ICAOCode: _unit });
    if (!unit) {
      return res.status(404).send("No Unit Found");
    }
  } catch (error) {}

  if (process.env.NODE_ENV == "development") {
    const fs = require("fs");
    const xmlTestData = fs.readFileSync("./devOps/tafdata.xml", "utf8");
    console.log("app.js", "Using DEV taf file");
    getTaf({ test: true, dataSource: xmlTestData })
      .then((response) => {
        response["airStation"] = unit;
        res.send(response);
      })
      .catch((error) => {
        console.log("ERROR", error);
      });
  } else {
    console.log("Prod Mode");
    const ICAOCode = unit.ICAOCode;
    const location = [unit.lat, unit.long]
    getTaf({ test: false, dataSource: ICAOCode, location})
      .then((response) => {
        response["airStation"] = unit;
        res.send(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

app.listen(port, () => {
  console.log("Listening on port " + port);
});


