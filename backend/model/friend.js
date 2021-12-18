
var mongoose =  require("mongoose");
var dotenv = require("dotenv");
dotenv.config();

const friendSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        maxLength: 20
    },
    googlePlaceId: {
        type: String,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    }
})

const Friend = mongoose.model('Friend', friendSchema);
module.exports = Friend;
