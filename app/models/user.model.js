const mongoose = require("mongoose");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        fullName: String,
        username: String,
        email: String,
        password: String,
        cart: {},
        roles:
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Role"
            }
    })
);

module.exports = User;