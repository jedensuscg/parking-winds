const app = Vue.createApp({
  data() {
    return {
      hideDetails: false,
      firstLoadCheck: true,
      dataTimestamp: -3600001,
      loadMsg: "LOADING",
      unitToFech: "",
      highWindWarning: false,
      lowTempWarning: false,
      airStation: undefined,
      viewingWindDir: 0,
      viewingWindSpeed: 0,
      metarWinds: {
        observationTime: '',
        windSpeed: 0,
        windDirection: 0,
        windGustSpeed: 0,
        windGustDir: 0,
      },
      winds: {
        prevailingWinds: {
          direction: 0,
          speed: 0,
        },
        highestWinds: {
          direction: 0,
          speed: 0,
          timeFrom: 0,
          timeTo: 0,
          timeFromLocal: 0,
          timeToLocal: 0,
        },
        highestGust: {
          direction: 0,
          time: 0,
          timeFrom: 0,
          timeTo: 0,
          timeFromLocal: 0,
          timeToLocal: 0,
        },
      },
      rawTaf: "",
      decodeTaf: {},
      lowestTemp: "",
      loadWinds: false,
      ctx: undefined,
      canvas: undefined,
      debugX: 0,
      debugY: 0,
      drawType: "",
      windColors: {
        light: "green",
        moderate: "yellow",
        heavy: "red",
      },
    };
  },
  mounted: function () {
    this.createCanvas();
    //this.createDiagram();
  },
  computed: {

  },
  methods: {
    changeIndicatorToLongForm: function (changeIndicator) {
      console.log(changeIndicator)
      let longFormChangeIndicator
      switch (changeIndicator) {

        case 'FM':
          longFormChangeIndicator = 'FROM: standard forecast or significant change'
          break;
        case 'BECMG':
          longFormChangeIndicator = 'BECOMING'
        break;
        case 'TEMPO':
          longFormChangeIndicator = 'TEMPORARY: changes expected for less than half the time period'
        break;
        default:
          break;
      }
      return longFormChangeIndicator
    },
    formatNumberToThreeDigits: function (value) {
      //if value is not integer, return value
      if (!isNaN(value)) {
      threeDigitValue = ('000' + value).substr(-3)
      return threeDigitValue
      } else {
        return value
      }
    },
    startAgain() {
      this.firstLoadCheck = true;
      this.ctx.clearRect(15, 15, this.airStation.airStaDim.width, this.airStation.airStaDim.height);
    },
    firstLoad(unit) {

      this.unitToFech = unit;
      this.createDiagram();

      this.firstLoadCheck = false;
    },
    async fetchData() {

      await fetch(`./taf/${this.unitToFech}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Running new fetch");
          this.viewingWindDir = data.METAR.rawMetarData.metarForecast[0].windDirection
          this.viewingWindSpeed = data.METAR.rawMetarData.metarForecast[0].windSpeed
          //console.table(data.airStation);
          console.log(data)
          this.decodeTaf = data.rawTafData;
          console.log(this.decodeTaf.tafForecasts.length);
          this.winds = data.winds;
          this.rawTaf = data.rawText;
          this.metarWinds = data.METAR.rawMetarData.metarForecast[0];
          this.lowestTemp = {
            time: data.lowestTemp[0],
            temp: Math.floor(data.lowestTemp[1]),
          };
          this.airStation = {
            unitName: data.airStation.unitName,
            airStaDim: data.airStation.airStaDim,
            parkingSpots: data.airStation.parkingSpots,
            radius: data.airStation.parkingSpots.radius,
            image: data.airStation.mapImage,
          };

          this.$refs.selectedUnit.textContent = this.airStation.unitName;
          this.convertToLocalTime();
          this.checkForWarnings();

        })
        .catch((e) => {
          console.log(e);
        });
    },
    convertToLocalTime (time) {
      const localTimeFull = new Date(time);
      const today = new Date()

      let localTime
      if (localTimeFull.getDate() === today.getDate()) {
        localTime = localTimeFull.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        localTime = localTimeFull.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          day: '2-digit',
          month: 'short'
        });
      }

      
      const localDay = localTimeFull.getDate()
      const localMonth = (localTimeFull.getMonth()) + 1
      const localDate = `${localMonth}/${localDay}`
      localTime = localTime.replace(':', "")
      localTime = localTime.replace(',', "")
      return localTime
    },

    checkForWarnings() {
      if (this.winds.prevailingWinds.speed > 22 || this.winds.highestGust.speed > 22) {
        this.highWindWarning = true;
      } else {
        this.highWindWarning = false;
      }
      if (this.lowestTemp.temp < 35) {
        this.lowTempWarning = true;
      } else {
        this.lowTempWarning = false;
      }
    },
    draw(e, drawType = "prevailing") {
      this.drawType = drawType;
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
          this.ctx.lineWidth = 10;
          this.ctx.strokeStyle = gradient;
          this.ctx.stroke();
          this.ctx.lineWidth = 2;

          this.airStation.parkingSpots.spots.forEach((spot) => {
            drawParkingSpot(spot);
          });
          this.airStation.parkingSpots.spots.forEach((spot) => {
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
        let windArrowLength, dir, windSpeed;
        this.drawPlanes(spot.x, spot.y, spot.baseHeading);
        if (drawType === "prevailing") {
          windSpeed = this.winds.prevailingWinds.speed;
          windArrowLength = windSpeed * 2;
          this.$refs.prevailingCol.classList.add("wind-data-col-active");
          this.$refs.strongestCol.classList.remove("wind-data-col-active");
          this.$refs.metarCol.classList.remove("wind-data-col-active");
          if (this.winds.highestGust.speed > 0) {
            this.$refs.gustCol.classList.remove("wind-data-col-active");
          }

          dir = this.winds.prevailingWinds.direction - 90;
        } else if (drawType === "highest") {
          windSpeed = this.winds.highestWinds.speed;
          windArrowLength = windSpeed * 2;
          if (this.metarWinds.windDirection != "Variable") {
            dir = this.winds.highestWinds.direction - 90;
          } else {
            dir = "Variable"
          }

          this.$refs.prevailingCol.classList.remove("wind-data-col-active");
          this.$refs.strongestCol.classList.add("wind-data-col-active");
          this.$refs.metarCol.classList.remove("wind-data-col-active");
          if (this.winds.highestGust.speed > 0) {
            this.$refs.gustCol.classList.remove("wind-data-col-active");
          }
        } else if (drawType === "gust") {
          windSpeed = this.winds.highestGust.speed;
          windArrowLength = windSpeed * 2;
          if (this.metarWinds.windDirection != "Variable") {
            dir = this.winds.highestGust.direction - 90;
          } else {
            dir = "Variable"
          }
          console.log(dir)
          this.$refs.prevailingCol.classList.remove("wind-data-col-active");
          this.$refs.strongestCol.classList.remove("wind-data-col-active");
          this.$refs.metarCol.classList.remove("wind-data-col-active");
          this.$refs.gustCol.classList.add("wind-data-col-active");
        } else if (drawType === 'metarWind') {
          windSpeed = this.metarWinds.windSpeed;
          this.viewingWindSpeed = windSpeed
          windArrowLength = windSpeed * 2;
          if (this.metarWinds.windDirection != "Variable") {
            dir = this.metarWinds.windDirection - 90;
          } else {
            dir = "Variable"
          }
          this.viewingWindDir = dir == "Variable"? dir : dir + 90
          console.log(dir)
          console.log(this.viewingWindDir)
          this.$refs.prevailingCol.classList.remove("wind-data-col-active");
          this.$refs.strongestCol.classList.remove("wind-data-col-active");
          if (this.winds.highestGust.speed > 0) {
            this.$refs.gustCol.classList.remove("wind-data-col-active");
          }
          this.$refs.metarCol.classList.add("wind-data-col-active");
        } else if (drawType === 'metarGusts') {
          windSpeed = this.metarWinds.windSpeed;
          windArrowLength = windSpeed * 2;
          if (windSpeed == '0') {
            windSpeed = "No Gusts"
            this.viewingWindSpeed = windSpeed
          } else {
            this.viewingWindSpeed = windSpeed
            if (this.metarWinds.windDirection != "Variable") {
              dir = this.metarWinds.windDirection - 90;
              this.viewingWindDir = dir + 90
            } else {
              dir = "Variable"
              this.viewingWindDir = dir
            }
          }
        
          this.$refs.prevailingCol.classList.remove("wind-data-col-active");
          this.$refs.strongestCol.classList.remove("wind-data-col-active");
          if (this.winds.highestGust.speed > 0) {
            this.$refs.gustCol.classList.remove("wind-data-col-active");
          }
          this.$refs.metarCol.classList.add("wind-data-col-active");
        }

        if (windArrowLength >= 90) {
          windArrowLength = 90;
        } else if (windArrowLength <= 20) {
          windArrowLength = 20;
        }

        startArrowPosX = spot.x + 54 * Math.cos((Math.PI * dir) / 180);
        startArrowPosY = spot.y + 54 * Math.sin((Math.PI * dir) / 180);

        this.ctx.beginPath();

        this.ctx.moveTo(startArrowPosX + 10 * Math.cos((Math.PI * dir) / 180), startArrowPosY + 10 * Math.sin((Math.PI * dir) / 180));
        this.ctx.lineWidth = 10;
        this.ctx.lineTo(
          startArrowPosX + (windArrowLength + 2) * Math.cos((Math.PI * dir) / 180),
          startArrowPosY + (windArrowLength + 2) * Math.sin((Math.PI * dir) / 180)
        );
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();

        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.moveTo(startArrowPosX + 10 * Math.cos((Math.PI * dir) / 180), startArrowPosY + 10 * Math.sin((Math.PI * dir) / 180));
        this.ctx.lineWidth = 6;
        this.ctx.lineTo(
          startArrowPosX + windArrowLength * Math.cos((Math.PI * dir) / 180),
          startArrowPosY + windArrowLength * Math.sin((Math.PI * dir) / 180)
        );
        this.ctx.strokeStyle = this.determineWindColor(windSpeed);
        this.ctx.stroke();

        //drawWindText(x, y, r, dir, spot)
        console.log(windSpeed)
        drawWindHead(startArrowPosX, startArrowPosY, dir, windSpeed);
        // Had to do this to stop ghost arrow from drawing.
        this.ctx.beginPath();
        this.ctx.closePath();
      };

      drawWindHead = (x, y, dir, windSpeed) => {
        this.ctx.beginPath();

        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 15 * Math.cos((Math.PI * (dir - 45)) / 180), y + 15 * Math.sin((Math.PI * (dir - 45)) / 180));
        this.ctx.lineTo(x + 15 * Math.cos((Math.PI * (dir + 45)) / 180), y + 15 * Math.sin((Math.PI * (dir + 45)) / 180));
        this.ctx.lineTo(x, y);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = "3";
        this.ctx.stroke();
        this.ctx.fillStyle = this.determineWindColor(windSpeed);

        this.ctx.fill();
        this.ctx.closePath();
      };

      drawAirsta(this.ctx);
    },
    createDiagram() {
      (async () => {
        time = Date.now();
        await this.fetchData();

        this.dataTimestamp = Date.now();

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
        img.src = "public/img/130top.svg";
      });
    },
    determineWindColor(windSpeed) {
      if (windSpeed <= 12) {
        windColor = this.windColors.light;
      } else if (windSpeed >= 22) {
        windColor = this.windColors.heavy;
      } else {
        windColor = this.windColors.moderate;
      }

      return windColor;
    },
    //DEBUG METHODS
    debugWindDraw() {
      this.ctx.clearRect(15, 15, this.airStation.airStaDim.width, this.airStation.airStaDim.height);
      this.draw();
      this.checkForWarnings();
    },
    handleMousemove(e, data) {
      this.debugX = e.offsetX;
      this.debugY = e.offsetY;
    },
  },
});

app.mount("#app");