
var express = require('express');
var router = express.Router();
var Address = require('../model/address')

/* GET address. */
router.get('/', async (req, res, next) => {
  const { addressId } = req.query;
  console.log(addressId);
  const fullAddress = await Address.findById(addressId);
  console.log(fullAddress);
  if(fullAddress)
  {
    res.json(fullAddress);
  }
  else
  {
    res.json(false);
  }
});

module.exports = router;
