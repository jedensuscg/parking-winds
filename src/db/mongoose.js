const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/ecas-winds-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})

const Units = mongoose.model('Unit', {
  unit: {
    type: String,
  },
  IATACode: {
    type: String,
  },
  mapImage: {
    type: String,
  },
  airStaDim: {
    width: {
      type: Number,
    },
    height: {
      type: Number
    }
  },
  parkingSpots: {
    radius: {type: Number},
    spots: [
      {
        spot: {type: Number},
          x: {type: Number},
          y: {type: Number},
          baseHeading: {type: Number}
        },
    ],
  }
})

const ecity = new Units({
  unit: "Elizabeth City",
  IATACode: "kecg",
  mapImage: "public/img/diagram.svg",
  airStaDim: {
    width: 900,
    height: 595, 
  },
  parkingSpots: {
    radius: 54,
    spots: [
        {
          spot: 1,
          x: 268,
          y: 348,
          baseHeading: 4,
        },
        {
          spot: 2,
          x: 375,
          y: 394,
          baseHeading: 4,
        },
        {
          spot: 3,
          x: 586,
          y: 302,
          baseHeading: 272,
        },
        {
          spot: 4,
          x: 694,
          y: 424,
          baseHeading: 272,
        },
      ],
  }
})

const sample = new Units({
  unit: "Sample Airporty",
  IATACode: "samp",
  mapImage: "public/img/diagram.svg",
  airStaDim: {
    width: 900,
    height: 595, 
  },
  parkingSpots: {
    radius: 54,
    spots: [
        {
          spot: 1,
          x: 268,
          y: 348,
          baseHeading: 34,
        },
        {
          spot: 2,
          x: 375,
          y: 394,
          baseHeading: 45,
        },
        {
          spot: 3,
          x: 586,
          y: 302,
          baseHeading: 130,
        },
        {
          spot: 4,
          x: 694,
          y: 424,
          baseHeading: 290,
        },
      ],
  }
})

sample.save().then(() => {
  console.log(ecity)
}).catch((error) => {
  console.log("ERROR:", error)
})