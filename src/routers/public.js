const express = require("express");
const router = new express.Router();
const path = require("path");

router.use("/public", express.static(path.join(__dirname, "../public")));

router.get('/dashboard', async (req, res) => {
  res.sendFile(path.resolve("./public/dashboard.html"))
})

router.get("/", async (req, res) => {
  res.sendFile(path.resolve("./public/index.html"));
});

module.exports = router;
