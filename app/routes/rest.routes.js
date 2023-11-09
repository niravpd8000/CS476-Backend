const {verifySignUp} = require("../middlewares");
const {authJwt} = require("../middlewares");
const restController = require("../controllers/restaurant.controller");
const manuController = require("../controllers/manu.controller");
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
        "/api/rest/signup",
        [
            verifySignUp.checkDuplicateUsernameOrEmail,
            verifySignUp.checkRolesExisted,
        ],
        restController.RestSignup
    );

    app.get("/api/rest/getAll", restController.getAllRestaurants);
    app.get("/api/rest/getRestaurantById/:id", restController.getRestaurantById);
    app.post("/api/rest/updateRestaurant/:id", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isRestaurantOwner], restController.updateRestaurantById);
    app.get("/api/rest/getManuByRestaurantId/:rest_id", manuController.getAllManuByRestaurantId);
    app.post("/api/rest/createManu", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isRestaurantOwner], manuController.createManu);
    app.get("/api/rest/getManuById/:itemId", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isRestaurantOwner], manuController.getManuItemById);
    app.post("/api/rest/updateManu", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isRestaurantOwner], manuController.updateManuItemById);
    app.post("/api/cart/createUpdate", [authJwt.verifyToken], cartController.createOrUpdateCart);
    app.get("/api/cart", [authJwt.verifyToken], cartController.getCartByUserId);
};
