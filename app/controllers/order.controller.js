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
            return res.status(200).send([]);
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
            return res.status(200).send([]);
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


exports.updateOrderStatusById = async (req, res) => {
    try {
        const orderId = req.body.order_id;
        const updatedStatus = req.body.status;

        const updatedOrder = await orderModel.update(orderId, {status: updatedStatus});

        if (!updatedOrder) {
            return res.status(404).send({message: 'Order not found.'});
        }

        res.status(200).send(updatedOrder);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};


exports.giveRating = async (req, res) => {
    try {
        const orderId = req.body.order_id;
        const rating = req.body.rating;
        const feedback = req.body.feedback;

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).send({message: 'Order not found.'});
        }

        order.rating = rating;
        order.feedback = feedback;

        const updatedOrder = await order.save();

        res.status(200).send(updatedOrder);
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};


exports.getRestaurantOrderItems = async (req, res) => {
    try {
        const rest_id = req.rest_id;
        const {timeInterval} = req.query;

        let startDate, endDate;

        switch (timeInterval) {
            case 'today':
                startDate = moment().startOf('day').utc();
                endDate = moment().endOf('day').utc();
                break;
            case 'thisWeek':
                startDate = moment().startOf('week').utc();
                endDate = moment().endOf('week').utc();
                break;
            case 'thisMonth':
                startDate = moment().startOf('month').utc();
                endDate = moment().endOf('month').utc();
                break;
            case 'thisYear':
                startDate = moment().startOf('year').utc();
                endDate = moment().endOf('year').utc();
                break;
            default:
                return res.status(400).send({message: 'Invalid time interval provided.'});
        }

        const query = {
            rest_id: rest_id,
            timestamp: {$gte: startDate, $lte: endDate},
        };

        const restaurantOrders = await orderModel.find(query).sort({timestamp: -1});

        if (!restaurantOrders || restaurantOrders.length === 0) {
            return res.status(200).send({
                itemCounts: {},
                ratings: 0,
                pickupOrders: [],
                reservationOrders: [],
            });
        }

        // Calculate total items sold
        const itemCounts = {};
        restaurantOrders.forEach(order => {
            order.items.forEach(item => {
                const itemName = item?.item?.name;
                itemCounts[itemName] = (itemCounts[itemName] || 0) + item?.quantity;
            });
        });

        // Extract orders with ratings
        const ordersWithRatings = restaurantOrders
            .filter(order => order.rating !== undefined)
            .map(order => ({
                orderId: order._id,
                rating: order.rating,
                feedback: order?.feedback || "No feedback",
                timestamp: order?.timestamp
            }));

        // Extract pickup orders and reservation orders
        const pickupOrders = restaurantOrders.filter(order => order.isPickUp === true);
        const reservationOrders = restaurantOrders.filter(order => order.isPickUp !== true);

        res.status(200).send({
            itemCounts,
            ratings: ordersWithRatings,
            pickupOrders: getCountsByTimeInterval(pickupOrders, timeInterval),
            reservationOrders: getCountsByTimeInterval(reservationOrders, timeInterval),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({message: err.message});
    }
};


function getCountsByTimeInterval(orders, timeInterval) {
    let groupByUnit;
    let dateFormat;

    switch (timeInterval) {
        case 'today':
            groupByUnit = 'hour';
            dateFormat = 'HH:00';
            break;
        case 'thisWeek':
            groupByUnit = 'day';
            dateFormat = 'YYYY-MM-DD';
            break;
        case 'thisMonth':
            groupByUnit = 'week';
            dateFormat = 'YYYY-MM-DD';
            break;
        case 'thisYear':
            groupByUnit = 'month';
            dateFormat = 'YYYY-MM';
            break;
        default:
            throw new Error('Invalid time interval provided.');
    }

    const countsByTimeInterval = orders.reduce((result, order) => {
        const timestamp = moment(order.timestamp).format(dateFormat);

        if (!result[timestamp]) {
            result[timestamp] = 1;
        } else {
            result[timestamp]++;
        }

        return result;
    }, {});

    return countsByTimeInterval;
}
