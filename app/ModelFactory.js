const UserModel = require("./models/user.model");
const RoleModel = require("./models/role.model");

class ModelFactory {
    constructor() {
        this.models = {
            User: new UserModel(),
            Role: new RoleModel(),
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
