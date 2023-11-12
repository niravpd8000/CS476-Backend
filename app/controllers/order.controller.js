const ModelFactory = require("../ModelFactory");
const orderModel = ModelFactory.createModel('Order');
const restaurantModel = ModelFactory.createModel('Restaurant');
const cartModel = ModelFactory.createModel('Cart');
const userModel = ModelFactory.createModel('User');
const moment = require('moment');

exports.createOrder = async (req, res) => {
    const {special_instruction, total_price, pickup_time, payment_type, tableDetails, isPickUp} = req.body;

    try {
        const cartDetails = await cartModel.findOne({userId: req.userId});

        if (!cartDetails) {
            return res.status(404).send({message: 'Cart not found for this user.'});
        }

        const {items, restaurantId} = cartDetails;

        const createdOrder = await orderModel.create({
            customer_id: req.userId,
            special_instruction,
            items,
            total_price,
            pickup_time,
            rest_id: restaurantId,
            payment_type,
            tableDetails,
            isPickUp,
            status: "Pending",
        });

        await cartModel.updateOne({userId: req.userId}, {items: [], restaurantId: null});

        res.status(201).send(createdOrder);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};


exports.getAllOrdersByUserId = async (req, res) => {
    try {
        const userId = req.userId;

        const userOrders = await orderModel.find({customer_id: userId}).sort({timestamp: -1});

        if (!userOrders || userOrders.length === 0) {
            return res.status(404).send({message: 'No orders found for this user.'});
        }
        const ordersWithRestaurantNames = await Promise.all(
            userOrders.map(async (order) => {
                const restaurant = await restaurantModel.findOne({_id: order.rest_id});

                return {
                    ...order.toObject(),
                    restaurantName: restaurant ? restaurant.name : 'Restaurant not found',
                    image_url: restaurant ? restaurant?.image_url : ''
                };
            })
        );

        res.status(200).send(ordersWithRestaurantNames);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};

exports.getAllOrdersByRestId = async (req, res) => {
    try {
        const restaurantId = req.rest_id;

        const restaurantOrders = await orderModel.find({rest_id: restaurantId}).sort({timestamp: -1});

        if (!restaurantOrders || restaurantOrders.length === 0) {
            return res.status(404).send({message: 'No orders found for this restaurant.'});
        }

        const ordersWithCustomerNames = await Promise.all(
            restaurantOrders.map(async (order) => {
                const customer = await userModel.findOne({_id: order.customer_id});

                return {
                    ...order.toObject(),
                    customerFullName: customer ? customer.fullName : 'Customer not found'
                };
            })
        );

        res.status(200).send(ordersWithCustomerNames);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};


exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.order_id;

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).send({message: 'Order not found.'});
        }

        const customer = await userModel.findOne({_id: order.customer_id});

        const restaurant = await restaurantModel.findOne({_id: order.rest_id});

        const orderWithDetails = {
            ...order.toObject(),
            restaurantName: restaurant ? restaurant.name : 'Restaurant not found',
            image_url: restaurant ? restaurant?.image_url : '',
            customerName: customer ? customer.fullName : 'Customer not found'
        };

        res.status(200).send(orderWithDetails);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};


