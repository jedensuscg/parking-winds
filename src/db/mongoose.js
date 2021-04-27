const mongoose = require("mongoose");

const MONGO_USERNAME = "jedens";
const MONGO_PASSWORD = "Ferr!s201";
console.log("attempting to connect to database")
mongoose.connect("mongodb://127.0.0.1:27017/ecas-winds-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}).then(() => {
  console.log("connected to database")
})


//  const ecity = new Unit({
//   unit: "Elizabeth City",
//   ICAOCode: "kecg",
//   mapImage: "public/img/diagram.svg",
//   airStaDim: {
//     width: 900,
//     height: 595,
//   },
//   parkingSpots: {
//     radius: 54,
//     spots: [
//       {
//         spot: 1,
//         x: 268,
//         y: 348,
//         baseHeading: 4,
//       },
//       {
//         spot: 2,
//         x: 375,
//         y: 394,
//         baseHeading: 4,
//       },
//       {
//         spot: 3,
//         x: 586,
//         y: 302,
//         baseHeading: 272,
//       },
//       {
//         spot: 4,
//         x: 694,
//         y: 424,
//         baseHeading: 272,
//       },
//     ],
//   },
// });

// const sample = new Unit({
//   unit: "Sample Airporty",
//   ICAOCode: "Kaaa",
//   mapImage: "public/img/diagram.svg",
//   airStaDim: {
//     width: 900,
//     height: 595,
//   },
//   parkingSpots: {
//     spots: [
//       {
//         spot: 1,
//         x: 268,
//         y: 348,
//         baseHeading: 220,
//       },
//       {
//         spot: 2,
//         x: 375,
//         y: 394,
//         baseHeading: 45,
//       },
//       {
//         spot: 3,
//         x: 586,
//         y: 302,
//         baseHeading: 130,
//       },
//       {
//         spot: 4,
//         x: 694,
//         y: 424,
//         baseHeading: 290,
//       },
//     ],
//   },
// });
