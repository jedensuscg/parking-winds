mongoose = require('mongoose')

const Unit = mongoose.model("Unit", {
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  IATACode: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
    validate(value) {
      if (value[0] != 'k') {
        console.log("first letter" , value[0])
        throw new Error('IATA Code must start with K')
      }
      if (value.length != 4) {
        throw new Error('IATA Code should only be 4 letters (i.e "KECG")')
      }
    }
  },
  mapImage: {
    type: String,
    required: true,
  },
  airStaDim: {
    width: {
      type: Number,
      required: true,
      min: [0, "Can't be negative"]
    },
    height: {
      type: Number,
      required: true,
      min: [0, "Can't be negative"],
    },
  },
  parkingSpots: {
    radius: { type: Number, default: 54, },
    spots: [
      {
        _id: false,
        spot: { type: Number, required: true },
        x: { type: Number, required: true},
        y: { type: Number, required: true },
        baseHeading: { type: Number, required: true, min: [0, "Value can't be negative"], max: [360, "Value can not be more than 360"] },
      },
    ],
  },
});

module.exports = Unit