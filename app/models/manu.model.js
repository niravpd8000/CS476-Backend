const BaseModel = require("./BaseModel");
class ManuModel extends BaseModel {
    constructor() {
        super("Manu", {
            name: String,
            rest_id: String,
            description: String,
            price: String,
            estimate_time: String,
            additional_details: String,
            available: Boolean,
            image_url: String,
        });
    }
}

module.exports = ManuModel;