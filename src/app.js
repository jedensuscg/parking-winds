const express = require("express");
const getTaf = require("./utils/getTaf");
const getUnit = require("./utils/getUnit");
const mongoose = require('./db/mongoose')
const { response } = require("express");
const Unit = require('./db/models/unit')
const fs = require("fs");
require("dotenv").config();
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;
let queryUnit = '';

app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(express.json())

app.get("/", (req, res) => {

  queryUnit = req.query
  if (queryUnit.unit == undefined) {
    queryUnit.unit = 'kecg'
  }
  console.log(queryUnit)

  res.sendFile(path.resolve("./public/index.html"));
});

app.post('/units', (req, res) => {
  const unit = new Unit(req.body)
  unit.save().then(() => {
    res.send(user)
  }).catch((error) => {
    res.status(400)
    res.send(error)
  })
})

app.get("/taf", (req, res) => {
  
  const unit = getUnit(queryUnit.unit)

  if (process.env.NODE_ENV == "development") {
    IATACode = queryUnit.unit
    const fs = require("fs");
    const xmlTestData = fs.readFileSync("./devOps/tafdata.xml", "utf8");
    console.log("app.js", "Using DEV taf file");
    getTaf({ test: true, dataSource: xmlTestData,})
      .then((response) => {
        
        response["airStation"] = unit
        res.send(response);
      })
      .catch((error) => {
        console.log("ERROR",error);
      });
  } else {
    console.log("Prod Mode");
    IATACode = queryUnit.unit
    getTaf({ test: false, dataSource: IATACode })
      .then((response) => {
        response["airStation"] = unit
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
