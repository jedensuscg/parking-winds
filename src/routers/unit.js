const express = require("express");
const router = new express.Router();
const Unit = require("../db/models/unit");

router.post("/units", async (req, res) => {
  const unit = new Unit(req.body);

  try {
    await unit.save();
    res.status(201).send(unit);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Get all Airstations data
router.get("/units", async (req, res) => {
  try {
    const units = await Unit.find({});
    res.send(units);
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/units/:unit", async (req, res) => {
  const _unit = req.params.unit.toLowerCase();

  try {
    const unit = await Unit.findOne({ ICAOCode: _unit });

    if (!unit) {
      return res.status(404).send("No Unit Found").send(unit);
    }

    res.status(201).send(unit);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/units/:unit", async (req, res) => {
  try {
    const unit = await Unit.findOneAndUpdate({ ICAOCode: req.params.unit }, req.body, { new: true, runValidators: true });

    if (!unit) {
      res.status(404).send("Unit not found");
    }

    res.send(unit);
  } catch (error) {
    return res.status(500).send();
  }
});

router.delete("/units/:unit", async (req, res) => {
  console.log(req.params.unit);
  try {
    const unit = await Unit.findOneAndDelete({ ICAOCode: req.params.unit });
    console.log(unit);

    if (!unit) {
      return res.status(404).send("Unit not found");
    }

    res.send({ Deleted: unit.unit });
  } catch (error) {
    res.status(500).send();
  }
});



module.exports = router;
