var mongoose =  require("mongoose");
var dotenv = require("dotenv");
dotenv.config();

const addressSchema = new mongoose.Schema({
    streetNumber: {
        type: String,
        maxlength: 10,
    },
    streetName: {
        type: String,
        maxlength: 100
    },
    suburb: {
        type: String,
        maxlength: 20
    },
    city: {
        type: String,
        maxlength: 20
    },
    country: {
        type: String,
        maxLength: 20
    },
    postalCode: {
        type: Number
    }
})

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
