// const airStaDim = {
//   width: 900,
//   height: 595,
// };
// const parkingSpots = {
//   spot1: {
//     x: 268,
//     y: 348,
//     baseHeading: 4,
//   },
//   spot2: {
//     x: 375,
//     y: 394,
//     baseHeading: 4,
//   },
//   spot3: {
//     x: 586,
//     y: 302,
//     baseHeading: 272,
//   },
//   spot4: {
//     x: 694,
//     y: 424,
//     baseHeading: 272,
//   },
//   radius: 54,
// };

const app = Vue.createApp({
  data() {
    return {
      dataTimestamp: -3600001,
      loadMsg: "LOADING",
      highWindWarning: false,
      lowTempWarning: false,
      airStation: undefined,
      winds: {
        prevailingWinds: {
          direction: 0,
          speed: 0
        },
        highestWinds: {
          direction: 0,
          speed: 0
        },
        highestGust: {
          direction: 0,
          time: 0
        }
      },
      rawTaf: "",
      decodeTaf: {
        forecast: []
      },
      lowestTemp: '',
      loadWinds: false,
      ctx: undefined,
      canvas: undefined,
      debugX: 0,
      debugY: 0,
      drawType: "",
    };
  },
  mounted: function () {
    this.createCanvas();
    this.createDiagram();
  },
  methods: {
    async fetchData() {
      await fetch("/taf")
        .then((response) => response.json())
        .then((data) => {
          console.table(data.winds);
          this.winds = data.winds
          this.rawTaf = data.rawText;
          this.lowestTemp = {
            time: data.lowestTemp[0],
            temp: Math.floor(data.lowestTemp[1])
          }
          this.airStation = {
            unitName: data.airStation.unit,
            airStaDim: data.airStation.airStaDim,
            parkingSpots: data.airStation.parkingSpots,
            radius: data.airStation.parkingSpots.radius,
            image: data.airStation.mapImage
          }
          console.table(this.winds.prevailingWinds.direction)
          console.table(this.airStation.radius)
          this.checkForWarnings();
        })
        .catch((e) => {
          console.log(e);
        });
    },
    checkForWarnings() {
      if (this.winds.prevailingWinds.speed > 22 || this.winds.highestGust.speed > 22) {
        this.highWindWarning = true
      }
      else {
        this.highWindWarning = false
      }
      if (this.lowestTemp.temp < 35) {
        this.lowTempWarning = true
      } else {
        this.lowTempWarning = false
      }
    },
    draw(e, drawType = "prevailing") {
      this.drawType = drawType
      drawAirsta = () => {
        (async () => {
          await this.drawBackground();
          this.ctx.rect(15, 15, this.airStation.airStaDim.width, this.airStation.airStaDim.height);
          gradient = this.ctx.createLinearGradient(0, 0, 900, 0);
          gradient.addColorStop(0, "rgb(245, 30, 2)");
          gradient.addColorStop(0.2222222222222222, "rgb(249, 249, 249)");
          gradient.addColorStop(0.5, "rgb(19, 0, 187)");
          gradient.addColorStop(0.797979797979798, "rgb(255, 255, 255)");
          gradient.addColorStop(1, "rgb(245, 30, 2)");
          this.ctx.lineWidth = 10
          this.ctx.strokeStyle = gradient 
          this.ctx.stroke();
          this.ctx.lineWidth = 2

          this.airStation.parkingSpots.spots.forEach(spot => {
            drawParkingSpot(spot)
          });
          this.airStation.parkingSpots.spots.forEach(spot => {
            drawWinds(spot);
          });
        })();
      };

      drawParkingSpot = (spot) => {
        this.ctx.beginPath();
        this.ctx.arc(spot.x, spot.y, this.airStation.radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.stroke();

        this.ctx.strokeStyle = "red";
      };

      drawWinds = (spot) => {
        let r, dir, baseR
        this.drawPlanes(spot.x, spot.y, spot.baseHeading);
        if (drawType === "prevailing") {
          r = this.winds.prevailingWinds.speed * 2;
          dir = this.winds.prevailingWinds.direction - 90;
        } else if(drawType === "highest") {
            r = this.winds.highestWinds.speed * 2;
            dir = this.winds.highestWinds.direction - 90;
        } 
        else if(drawType === "gust") {
          r = this.winds.highestGust.speed * 2;
          dir = this.winds.highestGust.direction - 90;
        }

        if (r >= 90) {
          r = 90;
        } else if (r <= 20) {
          r = 20;
        }

        x = spot.x + 54 * Math.cos((Math.PI * dir) / 180);
        y = spot.y + 54 * Math.sin((Math.PI * dir) / 180);

        this.ctx.beginPath();
        this.ctx.moveTo(x + 10 * Math.cos((Math.PI * dir) / 180), y + 10 * Math.sin((Math.PI * dir) / 180));
        this.ctx.lineWidth = 8;
        this.ctx.lineTo(x + r * Math.cos((Math.PI * dir) / 180), y + r * Math.sin((Math.PI * dir) / 180));
        this.ctx.stroke();

        //drawWindText(x, y, r, dir, spot)

        drawWindHead(x, y, dir)
        // Had to do this to stop ghost arrow from drawing.
        this.ctx.beginPath()
        this.ctx.closePath()
      };

      // drawWindText = (x, y, r, dir, spot) => {
      //   const baseR = r
      //   textOffset = r + 10;
      //   textX = (x + r * Math.cos((Math.PI * dir) / 180) * 1.8)
      //   textY = (y + textOffset * Math.sin((Math.PI * dir) / 180) * 1.25)
        
      //   const displayDir = (dir + 90) < 100 ? "0" + (dir + 90) : dir + 90
      //   const displaySpeed = baseR/2 + "kts"

      //   this.ctx.fillStyle = "white"
      //   this.ctx.fillRect(textX, textY - 20, 70, 20)
      //   this.ctx.font = "10pt Arial"
      //   this.ctx.fillStyle = "black"
      //   this.ctx.fillText(`${displayDir}@${displaySpeed}`, textX, textY - 5)

      // }

      drawWindHead = (x, y, dir) => {
        this.ctx.beginPath();

        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 15 * Math.cos((Math.PI * (dir - 45)) / 180), y + 15 * Math.sin((Math.PI * (dir - 45)) / 180));
        this.ctx.lineTo(x + 15 * Math.cos((Math.PI * (dir + 45)) / 180), y + 15 * Math.sin((Math.PI * (dir + 45)) / 180));
        this.ctx.lineTo(x, y);
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.ctx.fillStyle = "red";


        this.ctx.fill();
        this.ctx.closePath();
      };

      drawAirsta(this.ctx);
    },
    createDiagram() {
      (async () => {
        time = Date.now()
        console.log(time - this.dataTimestamp)
        //if (time - this.dataTimestamp > 3600000) {
          await this.fetchData();
          this.dataTimestamp = Date.now()
          console.log("Running new fetch")
        //}
        this.draw();
        this.loadWinds = true;
      })();
    },
    createCanvas() {
      this.canvas = document.querySelector("#airStation");
      this.ctx = this.canvas.getContext("2d");
    },
    drawBackground() {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const self = this;

        img.onload = function () {
          self.ctx.drawImage(img, 15, 15);
          resolve();
        };
        img.src = this.airStation.image;
      });
    },
    drawPlanes(x, y, dir) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const self = this;
        img.onload = function () {
          self.ctx.save();
          self.ctx.translate(x, y);
          self.ctx.rotate((dir * Math.PI) / 180);
          self.ctx.drawImage(img, -img.width / 2, -img.height / 2);
          self.ctx.restore();
          resolve();
        };
        img.src = 'public/img/130top.svg'
      });
    },
    //DEBUG METHODS
    debugWindDraw() {
      this.ctx.clearRect(15, 15, airStaDim.width, airStaDim.height);
      this.draw();
      this.checkForWarnings()
    },
    handleMousemove(e, data) {
      this.debugX = e.offsetX;
      this.debugY = e.offsetY;
    },
  },
});

app.mount("#app");
