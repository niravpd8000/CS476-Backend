const ManuModel = require("./models/manu.model");
const UserModel = require("./models/user.model");
const RoleModel = require("./models/role.model");
const RestaurantModel = require("./models/restaurant.model");
const CartModel = require("./models/cart.model");

class ModelFactory {
    constructor() {
        this.models = {
            Manu: new ManuModel(),
            User: new UserModel(),
            Role: new RoleModel(),
            Restaurant: new RestaurantModel(),
            Cart: new CartModel()
        };
    }

    getModel(collectionName) {
        if (this.models[collectionName]) {
            return this.models[collectionName];
        } else {
            throw new Error("Invalid collection name");
        }
    }
}

module.exports = new ModelFactory();
