const express = require("express");
const getTaf = require("./utils/getTaf");
const { response } = require("express");
const fs = require("fs");
require("dotenv").config();
const path = require('path')

const app = express();
const port = process.env.PORT || 3000;
const indexPath = path.join(__dirname, "../public")

app.get('/', (req, res) => {
  console.log(__dirname)
  res.sendFile(path.resolve('./public/index.html'));
});

app.get("/taf", (req, res) => {
  if (process.env.NODE_ENV == "development") {
    const fs = require("fs");
    const xmlTestData = fs.readFileSync("./devOps/tafdata.xml", "utf8");
    console.log('Using DEV taf file')
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
