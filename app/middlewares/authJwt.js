const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");

const ModelFactory = require('../ModelFactory');
const userModel = ModelFactory.createModel('User');
const roleModel = ModelFactory.createModel('Role');
const restaurantModel = ModelFactory.createModel('Restaurant');

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({message: "No token provided!"});
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({message: "Unauthorized!"});
        }
        req.userId = decoded.id;
        next();
    });
};

isAdmin = async (req, res, next) => {
    try {
        // Create instances of UserModel and RoleModel using the ModelFactory
        const user = await userModel.findById(req.userId).exec();
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }
        const roles = await roleModel.find({ _id: { $in: user.roles } });
        if (!roles) {
            return res.status(403).send({ message: 'Require Admin Role!' });
        }
        let isAdmin = false;
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === 'admin') {
                isAdmin = true;
                break;
            }
        }

        if (isAdmin) {
            next();
        } else {
            res.status(403).send({ message: 'Require Admin Role!' });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

isRestaurantOwner = async (req, res, next) => {
    try {
        const restaurant = await restaurantModel.findOne({ adminId: req.userId });
        if (!restaurant) {
            return res.status(403).send({ message: "Unauthorised!" });
        }
        req.rest_id = restaurant._id;
        next();
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const authJwt = {
    verifyToken,
    isAdmin,
    isRestaurantOwner
};
module.exports = authJwt;
