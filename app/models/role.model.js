const BaseModel = require("./BaseModel");
class RoleModel extends BaseModel {
    constructor() {
        super("Role", {
            name: String,
        });
    }
}

module.exports = RoleModel;