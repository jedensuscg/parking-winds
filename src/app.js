const express = require("express");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
require("./db/mongoose");
const getMetar = require("./utils/getMetar")
const getTaf = require("./utils/getTaf");
const Unit = require("./models/unit");
const unitRouter = require('./routers/unit')
const publicRouter = require('./routers/public')
const userRouter = require('./routers/user')
const adminRouter = require('./routers/admin')
const logger = require('./utils/logger');
const winston = require('winston');
const { error } = require("./utils/logger");

const app = express();
const port = process.env.PORT || 5000;




app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(unitRouter)
app.use(publicRouter)
app.use(userRouter)
app.use(adminRouter)

app.set('trust proxy', true)
app.get("/taf/:unit", async (req, res) => {
  const _unit = req.params.unit;
  let unit; 
  let metarData;
  const ip = req.ip
  try {
    unit = await Unit.findOne({ ICAOCode: _unit });
    if (!unit) {
      return res.status(404).send("No Unit Found");
    }
  } catch (error) {
    logger.error(error.stack)
  }

  if (process.env.NODE_ENV == "development") {

    const fs = require("fs");
    const xmlTestData = fs.readFileSync("./devOps/tafdata.xml", "utf8");
    const xmlTestMetarData = fs.readFileSync("./devOps/metardata.xml", "utf8");
    console.log("app.js", "Using DEV taf file");
    getTaf({ test: true, dataSource: xmlTestData })
      .then((response) => {
        response["airStation"] = unit;
        return response
      }).then((response) => {
        getMetar({ test: true, dataSource: xmlTestMetarData }).then((metar) => {
          metarData = metar
          response["METAR"] = metarData;

          logger.log({level: 'request', message: `Request from IP: ${ip}`, dataReceived: `${JSON.stringify(response)}`})
          res.send(response)
        })
      })
      .catch((error) => {
        logger.log(err.stack)
      });
  } else {
    const ICAOCode = unit.ICAOCode;
    const location = [unit.lat, unit.long]
    
    getTaf({ test: false, dataSource: ICAOCode, location})
      .then((response) => {
        response["airStation"] = unit;
        return response
      }).then((response) => {
        console.log("getting metar");
        getMetar({ test: false, dataSource: _unit }).then((metar) => {
          metarData = metar
          response["METAR"] = metarData;
          

        }).then(() => {
          logger.log({level: 'request', message: `Request from IP: ${ip}`, dataReceived: `${JSON.stringify(response)}`})
          res.send(response)
        })
      })
      .catch((error) => {
        logger.error(error.stack)
      });
  }
});



app.listen(port, () => {
  logger.info("Listening on port " + port);
});






