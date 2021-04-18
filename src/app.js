const express = require("express");
const getTaf = require("./utils/getTaf");
const getUnit = require("./utils/getUnit");
const { response } = require("express");
const fs = require("fs");
require("dotenv").config();
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;

app.use("/public", express.static(path.join(__dirname, "../public")));
app.get("/", (req, res) => {
  res.sendFile(path.resolve("./public/index.html"));
});

app.get("/taf", (req, res) => {
  const unit = getUnit()
  if (process.env.NODE_ENV == "development") {
    IATACode = unit.IATACode
    const fs = require("fs");
    const xmlTestData = fs.readFileSync("./devOps/tafdata.xml", "utf8");
    console.log("Using DEV taf file");
    getTaf({ test: true, dataSource: xmlTestData })
      .then((response) => {
        response["airStation"] = unit
        res.send(response);
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    console.log("Prod Mode");
    IATACode = unit.IATACode
    getTaf({ test: false, dataSource: IATACode })
      .then((response) => {
        response["airStation"] = unit
        console.log(response.airStation.parkingSpots.spots[2])
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
