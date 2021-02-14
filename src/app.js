const express = require("express");
const getTaf = require("./utils/getTaf");
const { response } = require("express");
const fs = require("fs");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  if (process.env.NODE_ENV == "development") {
    const fs = require("fs");
    const xmlTestData = fs.readFileSync("./devOps/tafdata.xml", "utf8");
    console.log('Get under Dev')
    getTafPromise = getTaf({ test: true, dataSource: xmlTestData })
      .then((response) => {
        res.send(response);
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    getTaf()
      .then((response) => {
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
