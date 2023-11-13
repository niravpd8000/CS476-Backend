const ModelFactory = require("../ModelFactory");
const cartModel = ModelFactory.createModel('Cart');
const restaurantModel = ModelFactory.createModel('Restaurant');

exports.createOrUpdateCart = async (req, res) => {
    const {restaurantId, item, quantity, special_instruction, cartItemId, pickup_time, isPickup} = req.body;
    const {userId} = req;

    try {
        // Find the user's cart by userId
        const existingCart = await cartModel.findOne({userId});

        if (existingCart) {
            // If a cart exists, update the restaurantId
            if (existingCart.restaurantId !== restaurantId) {
                existingCart.restaurantId = restaurantId;
                existingCart.items = [];
            }
            if (quantity !== 0 && !cartItemId)
                existingCart.items = [{item, quantity}, ...existingCart.items];
            else if (quantity === 0 && cartItemId) {
                existingCart.items = [...existingCart.items.filter(x => x._id.toString() !== cartItemId)];
            } else if (quantity !== 0 && cartItemId) {
                const indexOfObjectToUpdate = existingCart.items.findIndex(x => x._id.toString() === cartItemId);
                if (indexOfObjectToUpdate > -1)
                    existingCart.items[indexOfObjectToUpdate] = {item, quantity};
                existingCart.items = [...existingCart.items]
            }
            const updatedCart = await cartModel.update(existingCart._id, existingCart);
            res.status(200).send(updatedCart);
        } else {
            // If no cart exists for the user, create a new cart
            const newCart = await cartModel.create({
                userId,
                restaurantId,
                special_instruction,
                pickup_time,
                isPickup,
                items: [
                    {
                        item, quantity
                    },
                ],
            });

            res.status(201).send(newCart);
        }
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};


exports.getCartByUserId = async (req, res) => {
    try {
        // Find the cart by user ID and populate the restaurantId field with the corresponding restaurant data
        const cart = await cartModel.findOne({userId: req.userId});

        if (!cart) {
            return res.status(404).send({message: 'Cart not found for this user.'});
        }

        // Now 'cart.restaurantId' will contain the data from the referenced restaurant document
        // You can access the restaurant name and schedules as follows
        const restaurantId = cart.restaurantId;

        // Fetch the restaurant details using restaurantModel
        const restaurant = await restaurantModel.findById(restaurantId);

        if (!restaurant) {
            return res.status(200).send(cart);
        }

        cart.restaurantName = restaurant.name;
        cart.restaurantSchedules = restaurant.schedules;

        const cartWithDetails = {
            ...cart.toObject(),
            restaurantName: restaurant ? restaurant.name : 'Restaurant not found',
            restaurantSchedules: restaurant ? restaurant.schedules : []
        };

        res.status(200).send(cartWithDetails);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};

