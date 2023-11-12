const BaseModel = require("./BaseModel");

class OrderModel extends BaseModel {
    constructor() {
        super("Order", {
            customer_id: String,
            special_instruction: String,
            items: [Object],
            rest_id: String,
            payment_type: String,
            total_price: Number,
            status: String,
            pickup_time: Date,
            isPickUp: Boolean,
            tableDetails: {
                number_of_people: Number,
                arrival_time: Date
            },
            rating: {
                type: Number,
                default: 0
            },
            feedback: String,
            timestamp: {
                type: Date,
                default: Date.now,
            },
        });
    }
}

module.exports = OrderModel;