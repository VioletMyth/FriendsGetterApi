var mongoose =  require("mongoose");
var dotenv = require("dotenv");
dotenv.config();

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 50,
  },
  username: {
    type: String,
    required: true,
    maxLength: 50,
  },
  email: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 1024,
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Friend"
  }],
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address"
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
