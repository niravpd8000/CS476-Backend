let bcrypt = require("bcryptjs");
const ModelFactory = require("../ModelFactory");
const userModel = ModelFactory.createModel('User');
const restaurantModel = ModelFactory.createModel('Restaurant');
const roleModel = ModelFactory.createModel('Role');
const orderModel = ModelFactory.createModel('Order');

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

        const defaultRole = await roleModel.findOne({name: 'admin'});
        const role = [defaultRole._id];
        // Create a new User document for the admin
        const user = await userModel.create({
            username: req.body?.username?.toLowerCase(),
            fullName: req.body?.fullName,
            email: req.body?.email,
            password: bcrypt.hashSync(req.body?.password, 8),
            roles: role,
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
            return res.status(200).send([]);
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

        // Fetch orders for the restaurant
        const orders = await orderModel.find({ rest_id: restaurantId });

        // Calculate average order rating
        let totalRating = 0;
        let totalOrdersWithRating = 0;

        orders.forEach(order => {
            if (order.rating && order.rating > 0) {
                totalRating += order.rating;
                totalOrdersWithRating++;
            }
        });

        const averageRating = totalOrdersWithRating > 0
            ? totalRating / totalOrdersWithRating
            : 0;

        // Include average rating in the response
        const restaurantWithRating = {
            ...restaurant.toObject(),
            averageOrderRating: averageRating,
        };

        res.status(200).send(restaurantWithRating);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};


exports.updateRestaurantById = async (req, res) => {
    try {
        const restaurantId = req.rest_id;
        const updatedRestaurantData = req.body;
        const updatedRestaurant = await restaurantModel.update(
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
