var express = require("express");
var router = express.Router();
var User = require("../model/user");
var Address = require("../model/address");
var Friend = require("../model/friend");

/* GET user. */
router.get("/", async (req, res, next) => {
  const { username, password } = req.query;
  const user = await User.find({ username: username, password: password });
  if (user.length === 1) {
    res.json(user);
  } else {
    res.json(false);
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const {
    username,
    password,
    email,
    streetNumber,
    streetName,
    suburb,
    city,
    country,
    postalCode,
  } = req.body;

  const user = await User.findById(id);
  const address = await Address.findById(user.address);
  if (user && address) {
    user.username = username;
    user.password = password;
    user.email = email
    user.save();
    address.streetNumber = streetNumber;
    address.streetName = streetName;
    address.suburb = suburb;
    address.city = city;
    address.postalCode = postalCode;
    address.country = country;
    address.save();
    res.json(user);
  } else {
    res.json(false);
  }
});

router.get("/get-full-user-details", async (req, res, next) => {
  const { username, password } = req.query;
  const users = await User.find({ username: username, password: password });
  if (users.length === 1) {
    const friendsIdArray = users[0].friends;
    const friendsDetailsArray = await Promise.all(
      friendsIdArray.map((friendId) => Friend.findById(friendId))
    );
    const addressDetails = await Promise.all(
      friendsDetailsArray.map((friend) => Address.findById(friend.address))
    );
    const resultArray = friendsDetailsArray.map((friend, index) => {
      return {
        ...friend.toObject(),
        address: addressDetails[index].toObject(),
      };
    });
    res.json(resultArray);
  } else {
    res.json(false);
  }
});

/* Create user entry */
router.post("/", async (req, res, next) => {
  const { name, username, email, password, address } = req.body;
  console.log(req.body)
  const { streetNumber, streetName, suburb, city, country, postalCode } =
    address;

  const addressRecord = new Address({
    streetNumber: streetNumber,
    streetName: streetName,
    suburb: suburb,
    city: city,
    country: country,
    postalCode: postalCode,
  });
  const addressSaved = await addressRecord.save();

  const user = new User({
    name: name,
    username: username,
    email: email,
    password: password,
    friends: [],
    address: addressSaved.id,
  });

  const result = await user.save();
  res.json(result);
});

module.exports = router;
