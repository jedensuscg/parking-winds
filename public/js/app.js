const airStaDim = {
  width: 900,
  height: 595,
};
const parkingSpots = {
  spot1: {
    x: 268,
    y: 348,
    baseHeading: 4
  },
  spot2: {
    x: 375,
    y: 394,
    baseHeading: 4
  },
  spot3: {
    x: 586,
    y: 302,
    baseHeading: 272
  },
  radius: 54,
};

const app = Vue.createApp({
  data() {
    return {
      winds: {
        prevailingWindDir: 0,
        prevailingWindSpeed: 0,
        highestWindDir: 0,
        highestWindSpeed: 0,
      },
      rawTaf: "",
      loadWinds: false,
      ctx: undefined,
      canvas: undefined,
      debugX: 0,
      debugY: 0
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
          this.winds.prevailingWindDir = data.winds.prevailingWinds.direction;
          this.winds.prevailingWindSpeed = data.winds.prevailingWinds.speed;
          this.winds.highestWindDir = data.winds.highestWinds.direction
          this.winds.highestWindSpeed = data.winds.highestWinds.speed
          this.rawTaf = data.rawText
          console.log("inside fetch");
        })
        .catch((e) => {
          console.log(e);
        });
    },
    draw() {
      drawAirsta = () => {
        (async () => {
          await this.drawBackground()
          this.ctx.rect(15, 15, airStaDim.width, airStaDim.height);
          this.ctx.stroke();
          drawParkingSpot();
          await drawWind(parkingSpots.spot1);
          await drawWind(parkingSpots.spot2);
          await drawWind(parkingSpots.spot3);

        })();

      };

      drawParkingSpot = () => {

        this.ctx.beginPath();
        this.ctx.arc(parkingSpots.spot1.x, parkingSpots.spot1.y, parkingSpots.radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(parkingSpots.spot2.x, parkingSpots.spot2.y, parkingSpots.radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(parkingSpots.spot3.x, parkingSpots.spot3.y, parkingSpots.radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.stroke();
      };

      drawWind = (spot) => {
        // TODO Clamp the radius for higher wind speeds.
        r = this.winds.prevailingWindSpeed * 3;
        dir = this.winds.prevailingWindDir - 90;


        x = spot.x + 54 * Math.cos((Math.PI * dir) / 180);
        y = spot.y + 54 * Math.sin((Math.PI * dir) / 180);
        this.ctx.beginPath();
        this.ctx.moveTo(x + 10 * Math.cos((Math.PI * dir) / 180), y + 10 * Math.sin((Math.PI * dir) / 180));
        this.ctx.lineWidth = 8
        this.ctx.lineTo(x + r * Math.cos((Math.PI * dir) / 180), y + r * Math.sin((Math.PI * dir) / 180));
        this.ctx.stroke();
        this.drawPlanes(spot.x, spot.y, spot.baseHeading)
        drawWindHead(x, y, dir);
      };

      drawWindHead = (x, y, dir) => {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 15 * Math.cos((Math.PI * (dir - 45)) / 180), y + 15 * Math.sin((Math.PI * (dir - 45)) / 180));
        this.ctx.lineTo(x + 15 * Math.cos((Math.PI * (dir + 45)) / 180), y + 15 * Math.sin((Math.PI * (dir + 45)) / 180));
        this.ctx.lineTo(x, y)
        this.ctx.lineWidth = 1
        this.ctx.stroke();
        this.ctx.fillStyle = 'red'
        this.ctx.fill()
      };

      drawAirsta(this.ctx);
    },
    createDiagram() {
      (async () => {
        await this.fetchData();
        this.draw();
        this.loadWinds = true;
      })();
    },
    createCanvas() {
      this.canvas = document.querySelector("#airstation");
      this.ctx = this.canvas.getContext("2d");
    },
    drawBackground() {
      return new Promise((resolve, reject) => {
      const img = new Image();
      const self = this;
      
      img.onload = function () {
        self.ctx.drawImage(img, 15, 15);
        resolve()
      };
      img.src = "public/img/diagram.svg";
      })
    },
    drawPlanes(x, y, dir) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const self = this;
        img.onload = function () {
          self.ctx.save()
          self.ctx.translate(x, y)
          self.ctx.rotate(dir * Math.PI / 180)
          self.ctx.drawImage(img, -img.width/2, -img.height/2);
          self.ctx.restore()
          resolve()
        };
        img.src = "public/img/130top.svg";
      })

    },
    //DEBUG METHODS
    debugWindDraw() {
      this.ctx.clearRect(15, 15, airStaDim.width, airStaDim.height);
      this.draw();
    },
    handleMousemove(e, data) {
      this.debugX = e.offsetX
      this.debugY = e.offsetY
    }
  },
});

app.mount("#app");
