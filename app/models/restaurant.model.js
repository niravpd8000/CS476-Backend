const BaseModel = require("./BaseModel");

class Restaurant extends BaseModel {
    constructor() {
        super("Restaurant", {
            name: String,
            description: String,
            phone: String,
            email: String,
            provide_reservation: Boolean,
            number_of_table: Number,
            image_url: String,
            adminId: String,
            table_capacity: [
                {capacity: Number}
            ],
            address: {
                stateId: String,
                cityId: String,
                address: String,
                zipcode: String
            },
            categories: [String],
            schedules: [
                {
                    day: String,
                    status: Boolean,
                    times: [
                        {
                            startTime: String,
                            endTime: String
                        }
                    ]
                }
            ]

        });
    }
}

module.exports = Restaurant;