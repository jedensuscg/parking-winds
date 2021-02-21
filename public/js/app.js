let winds = {
  windDir: 360,
  windSpeed: 25,
};
const airStaDim = {
  width: 400,
  height: 500,
};
const spots = {
  spot1: {
    x: airStaDim.width / 3 + 15,
    y: airStaDim.height / 2 + 40,
  },
  spot2: {
    x: airStaDim.width / 2 + 15,
    y: airStaDim.height / 4 + 15,
  },
  radius: 15,
};

fetch("/taf")
  .then((response) => response.json())
  .then((data) => {
    console.table(data.winds)
    winds.windDir = data.winds.prevailingWinds.direction;
    winds.windSpeed = data.winds.prevailingWinds.speed;

    const canvas = document.querySelector("#airstation");
    const ctx = canvas.getContext("2d");

    drawAirsta = () => {
      ctx.rect(15, 15, airStaDim.width, airStaDim.height);
      ctx.stroke();
      drawParkingSpot();
      drawWind(spots.spot1);
      drawWind(spots.spot2);
    };

    drawParkingSpot = () => {
      ctx.beginPath();

      ctx.arc(spots.spot1.x, spots.spot1.y, spots.radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#FF0000";
      ctx.stroke();

      ctx.beginPath();

      ctx.arc(spots.spot2.x, spots.spot2.y, spots.radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#FF0000";
      ctx.stroke();
    };

    drawWind = (spot) => {
      r = winds.windSpeed * 1.5;
      dir = winds.windDir - 90;

      x = spot.x + 18 * Math.cos((Math.PI * dir) / 180);
      y = spot.y + 18 * Math.sin((Math.PI * dir) / 180);
      ctx.moveTo(x, y);
      ctx.lineTo(x + r * Math.cos((Math.PI * dir) / 180), y + r * Math.sin((Math.PI * dir) / 180));
      ctx.stroke();
      drawWindHead(x, y, dir);
    };

    drawWindHead = (x, y, dir) => {
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10 * Math.cos((Math.PI * (dir - 30)) / 180), y + 10 * Math.sin((Math.PI * (dir - 30)) / 180));
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10 * Math.cos((Math.PI * (dir + 30)) / 180), y + 10 * Math.sin((Math.PI * (dir + 30)) / 180));
      ctx.stroke();
    };

    drawAirsta(ctx);
  });
