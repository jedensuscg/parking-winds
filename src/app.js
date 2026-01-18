require("dotenv").config();
require("./db/mongoose");
const express = require("express");
const path = require("path");
const fs = require("fs");
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

// Define a route to handle GET requests for TAF data based on a unit
app.get("/taf/:unit", async (req, res) => {
  const _unit = req.params.unit; // Extract the unit parameter from the request
  let unit; 
  let metarData;
  const ip = req.ip; // Get the IP address of the client making the request
  try {
    // Find the unit in the database based on the ICAO code
    unit = await Unit.findOne({ ICAOCode: _unit });
    if (!unit) {
      return res.status(404).send("No Unit Found"); // Return 404 if the unit is not found
    }
  } catch (error) {
    logger.error(error.stack); // Log any errors that occur during the database query
  }

  // Check if the application is running in development mode
  if (process.env.NODE_ENV == "development") {
    const fs = require("fs");

    // Read test TAF and METAR data from local files
    const testTafRaw = fs.readFileSync("./devOps/testTaf.json", "utf8");
    const testTafData = JSON.parse(testTafRaw);

    const testMetarRaw = fs.readFileSync("./devOps/testTaf.json", "utf8");
    const testMetarData = JSON.parse(testMetarRaw);

    console.log("app.js", "Using DEV taf and Metar files");

    // Fetch TAF data using the test data
    getTaf({ test: true, dataSource: testTafData })
      .then((response) => {
        response["airStation"] = unit; // Add the unit information to the response
        return response;
      })
      .then((response) => {
        // Fetch METAR data using the test data
        getMetar({ test: true, dataSource: testMetarData }).then((metar) => {
          metarData = metar;
          response["METAR"] = metarData; // Add the METAR data to the response

          // Log the request details and send the response
          logger.log({
            level: 'request',
            message: `Request from IP: ${ip}`,
            dataReceived: `${JSON.stringify(response)}`
          });
          res.send(response);
        });
      })
      .catch((error) => {
        // Handle any errors that occur during the process
        logger.log(error.stack)
      });
  } else {
    // If not in development mode, fetch live data
    const ICAOCode = unit.ICAOCode;
    const location = [unit.lat, unit.long];

    // Fetch TAF data using live data
    getTaf({ test: false, dataSource: ICAOCode, location })
      .then((response) => {
        response["airStation"] = unit; // Add the unit information to the response
        return response;
      })
      .then((response) => {
        console.log("getting metar");
        // Fetch METAR data using live data
        getMetar({ test: false, dataSource: _unit }).then((metar) => {
          metarData = metar;
          response["METAR"] = metarData; // Add the METAR data to the response
          
        }).then(() => {
          // Log the request details and send the response
          logger.log({
            level: 'request',
            message: `Request from IP: ${ip}`,
            dataReceived: `${JSON.stringify(response)}`
          });
          console.log(response)
          res.send(response);
        });
      })
      .catch((error) => {
        // Log any errors that occur during the process
        logger.error(error.stack);
      });
  }
});



app.listen(port, () => {
  logger.info("Listening on port " + port);
});






