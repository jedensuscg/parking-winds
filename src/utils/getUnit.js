//TODO Convert to function that retrieves data from MongoDB collection, based on query string.

function getUnit() {
  elizabethcity = {
    unit: "Elizabeth CIty",
    IATACode: "kecg",
    mapImage: "public/img/diagram.svg",
    airStaDim: {
      width: 900,
      height: 595,
    },
    parkingSpots: {
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
      radius: 54,
    },
  };

  return elizabethcity;
}

module.exports = getUnit;
