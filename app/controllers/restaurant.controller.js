let bcrypt = require("bcryptjs");
const ModelFactory = require("../ModelFactory");
const userModel = ModelFactory.createModel('User');
const restaurantModel = ModelFactory.createModel('Restaurant');

exports.RestSignup = async (req, res) => {
    try {
        const {
            name,
            description,
            phone,
            email,
            number_of_table,
            address,
            schedules,
            provide_reservation,
            table_capacity,
            categories,
            image_url
        } = req.body;

        // Create a new User document for the admin
        const user = await userModel.create({
            username: req.body?.username?.toLowerCase(),
            fullName: req.body?.fullName,
            email: req.body?.email,
            password: bcrypt.hashSync(req.body?.password, 8),
            roles: ['admin'],
        });

        // Create a new Restaurant document
        const restaurant = await restaurantModel.create({
            name,
            description,
            phone,
            email,
            number_of_table,
            address,
            schedules,
            provide_reservation,
            table_capacity,
            categories,
            image_url,
            adminId: user._id
        });

        res.status(201).send({data: restaurant, message: 'Restaurant registered successfully!'});
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};


exports.getAllRestaurants = async (req, res) => {
    try {
        // Use the findById method from the restaurantModel to retrieve the restaurant by ID
        const restaurant = await restaurantModel.find();

        if (!restaurant) {
            return res.status(404).send({message: 'Restaurant not found.'});
        }

        res.status(200).send(restaurant);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};

exports.getRestaurantById = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        // Use the findById method from the restaurantModel to retrieve the restaurant by ID
        const restaurant = await restaurantModel.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).send({message: 'Restaurant not found.'});
        }

        res.status(200).send(restaurant);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};


exports.updateRestaurantById = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const updatedRestaurantData = req.body;
        // Use the findByIdAndUpdate method from the restaurantModel to update the restaurant by ID
        const updatedRestaurant = await restaurantModel.findByIdAndUpdate(
            restaurantId,
            updatedRestaurantData,
            {new: true, runValidators: true}
        );

        if (!updatedRestaurant) {
            return res.status(404).send({message: 'Restaurant not found.'});
        }

        res.status(200).send(updatedRestaurant);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};
