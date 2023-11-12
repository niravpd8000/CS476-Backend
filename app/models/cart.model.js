const BaseModel = require("./BaseModel");

class CartModel extends BaseModel {
    constructor() {
        super("Cart", {
            items: [
                {
                    item: {},
                    quantity: Number,
                },
            ],
            userId: String,
            special_instruction: String,
            pickup_time: String,
            isPickup: Boolean,
            restaurantId: String,
        });
    }
}

module.exports = CartModel;