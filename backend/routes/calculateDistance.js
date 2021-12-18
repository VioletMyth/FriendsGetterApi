var express = require("express");
var router = express.Router();
var distanceCalculator = require("../services/distanceCalculator")

/* GET lowest duartion path. */
router.get("/", async (req, res, next) => {
  let {originDestination, intermediateDestinations, finalDestination} = req.query
  try
  {
    if(!Array.isArray(intermediateDestinations))
    {
      intermediateDestinations = [intermediateDestinations]
    }
    const responseData = await distanceCalculator(originDestination, intermediateDestinations, finalDestination);
    res.json(responseData);
  }
  catch(e)
  {
    console.error(e);
  }
});

module.exports = router;
