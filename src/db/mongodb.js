const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const getUnit = require("../utils/getUnit");

const connectionUrl = "mongodb://127.0.0.1:27017";
const databaseName = "ecas-winds";

function getUnitFromDB(IATACode) {
  let unit = ""
  MongoClient.connect(connectionUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) {
      return console.log("Unable to connect", error);
    }

    const db = client.db(databaseName);
    const units = db.collection("units");
    //units.insertOne(getUnit());

    units
      .findOne({ IATACode: IATACode })
      .then((result) => {
        unit = result
      })
      .catch((error) => {
        console.log("ERROR:", error);
      });

    // units.updateOne(
    //   { IATACode: "kecg" },
    //   {
    //     $set: {
    //       unit: "Elizabeth City",
    //     },
    //   }
    // ).then((result) => {
    //   console.log(result)
    // }).catch((error)=> {
    //   console.log(error)
    // });
    console.log(unit)
  })

  return unit
}

module.exports = getUnitFromDB;
