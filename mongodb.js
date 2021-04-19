const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const getUnit = require("./src/utils/getUnit");

const connectionUrl = "mongodb://127.0.0.1:27017";
const databaseName = "ecas-winds";

MongoClient.connect(connectionUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
  if (error) {
    return console.log("Unable to connect", error);
  }

  const db = client.db(databaseName);
  const units = db.collection("units");
  //units.insertOne(getUnit());

  // units.findOne({ IATACode: "kecg" }, (error, unit) => {
  //   {
  //     if (error) {
  //       return console.log(error);
  //     }
  //     console.log(unit);
  //   }
  // });

  units.updateOne(
    { IATACode: "kecg" },
    {
      $set: {
        unit: "Elizabeth City",
      },
    }
  ).then((result) => {
    console.log(result)
  }).catch((error)=> {
    console.log(error)
  });
});
