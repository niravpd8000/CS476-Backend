const BaseModel = require("./BaseModel");

class UserModel extends BaseModel {
    constructor() {
        super("User", {
            fullName: String,
            username: String,
            email: String,
            password: String,
            cart: {},
            roles:[]
        });
    }
}

module.exports = UserModel;