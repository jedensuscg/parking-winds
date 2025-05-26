mongoose = require('mongoose')

const unitSchema = new mongoose.Schema({
  unitName: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
  },
  ICAOCode: {
    type: String,
    unique: true,
    trim: true,
    required: true,
    lowercase: true,
    validate(value) {
      if (value.length != 4) {
        throw new Error('ICAO Code should only be 4 letters (i.e "KECG")')
      }
    }
  },
  lat: {
    type: Number,
    trim: true,
    required: true
  },
  long: {
    type: Number,
    trim: true,
    required: true
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
        lat: { type: Number, required: true},
        long: { type: Number, required: true },
        baseHeading: { type: Number, required: true, min: [0, "Value can't be negative"], max: [360, "Value can not be more than 360"] },
      },
    ],
  },
});



// const Unit = mongoose.model("Unit", {
  
// });

const Unit = mongoose.model("Unit", unitSchema); 

module.exports = Unit
