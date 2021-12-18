var express = require("express");
var router = express.Router();
var Address = require("../model/address");
var Friend = require("../model/friend");
var User = require("../model/user");
var axios = require("axios");
var dotenv = require("dotenv");

dotenv.config();

/* GET friend. */
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  const friendRecord = await Friend.findById(id);
  if (friendRecord) {
    res.json(friendRecord);
  } else {
    res.json(false);
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { streetNumber, streetName, suburb, city, country, postalCode } =
    req.body;
  const friendRecord = await Friend.findById(id);
  const addressRecord = await Address.findById(friendRecord.address);

  const fullAddressString =
    streetNumber +
    " " +
    streetName +
    ", " +
    suburb +
    ", " +
    city +
    ", " +
    country +
    ", " +
    postalCode;
  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?`;

  const query = new URLSearchParams({
    query: fullAddressString,
    key: process.env.googleAPIKey,
  });

  url += query;

  const response = await axios.get(url);

  friendRecord.googlePlaceId = response.data.results[0].place_id;
  friendRecord.save()

  addressRecord.streetNumber = streetNumber;
  addressRecord.streetName = streetName;
  addressRecord.suburb = suburb;
  addressRecord.city = city;
  addressRecord.country = country;
  addressRecord.postalCode = postalCode;
  addressRecord.save();

  if (addressRecord) {
    res.json(addressRecord);
  } else {
    res.json(false);
  }
});

router.post("/", async (req, res, next) => {
  const { name, userId, address } = req.body;
  const { streetNumber, streetName, suburb, city, country, postalCode } =
    address;

  const friendAddress = new Address({
    streetNumber: streetNumber,
    streetName: streetName,
    suburb: suburb,
    city: city,
    country: country,
    postalCode: postalCode,
  });
  const addressSaved = await friendAddress.save();

  const fullAddressString =
    streetNumber +
    " " +
    streetName +
    ", " +
    suburb +
    ", " +
    city +
    ", " +
    country +
    ", " +
    postalCode;
  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?`;

  const query = new URLSearchParams({
    query: fullAddressString,
    key: process.env.googleAPIKey,
  });

  url += query;

  const response = await axios.get(url);

  const friendRecord = new Friend({
    name: name,
    user: userId,
    address: addressSaved.id,
    googlePlaceId: response.data.results[0].place_id,
  });

  const friendSaved = await friendRecord.save();
  const user = await User.findById(userId);
  user.friends = [...user.friends, friendSaved.id];
  user.save();
  res.json(friendSaved);
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.query;
  console.log(userId);
  const deletedFriend = await Friend.findByIdAndDelete(id);
  const deletedFriendAddress = await Address.findByIdAndDelete(
    deletedFriend.address
  );
  const deletedFriendUser = await User.updateOne(
    { _id: userId },
    { $pull: { friends: deletedFriend.id } }
  );

  if (deletedFriend && deletedFriendAddress && deletedFriendUser) {
    res.json(deletedFriend);
  }
});

module.exports = router;
