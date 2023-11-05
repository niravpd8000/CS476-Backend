const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Restaurant = db.restaurant;

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

isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }

        Role.find(
            {
                _id: {$in: user.roles}
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "admin") {

                        next();
                        return;
                    }
                }

                res.status(403).send({message: "Require Admin Role!"});
                return;
            }
        );
    });
};

isRestaurantOwner = (req, res, next) => {
    Restaurant.findOne({ adminId: req.userId }).exec((err, restaurant) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (!restaurant) {
            res.status(403).send({ message: "Unauthorised!" });
            return;
        }

        req.rest_id = restaurant._id;
        next();
    });
};

const authJwt = {
    verifyToken,
    isAdmin,
    isRestaurantOwner
};
module.exports = authJwt;
