const {verifySignUp} = require("../middlewares");
const {authJwt} = require("../middlewares");
const restController = require("../controllers/restaurant.controller");

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
};
