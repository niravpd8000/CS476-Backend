const {verifySignUp} = require("../middlewares");
const {authJwt} = require("../middlewares");
const restController = require("../controllers/restaurant.controller");
const orderController = require("../controllers/order.controller");
const cartController = require("../controllers/cart.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/order/create",
        [authJwt.verifyToken],
        orderController.createOrder
    );
    app.get("/api/order/restaurant", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isRestaurantOwner], orderController.getAllOrdersByRestId);
    app.get("/api/order/user", [authJwt.verifyToken], orderController.getAllOrdersByUserId);
    app.get("/api/order/getOrder/:order_id", [authJwt.verifyToken], orderController.getOrderById);
    app.post("/api/order/order-rating", [authJwt.verifyToken], orderController.giveRating);
    app.post("/api/order/updateStatus", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isRestaurantOwner], orderController.updateOrderStatusById);
    app.get("/api/order/dashboard/itemCounts", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isRestaurantOwner], orderController.getRestaurantOrderItems);

};