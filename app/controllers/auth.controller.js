const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Restaurant = db.restaurant;

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    const user = new User({
        username: req.body?.username.toLowerCase(),
        fullName: req.body?.fullName,
        email: req.body?.email,
        password: bcrypt.hashSync(req.body?.password, 8)
    });

    user.save((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }

        if (req.body.roles) {
            Role.find(
                {
                    name: {$in: req.body.roles}
                },
                (err, roles) => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }

                    user.roles = roles.map(role => role._id);
                    user.save((err) => {
                        if (err) {
                            res.status(500).send({message: err});
                            return;
                        }
                        res.send({data: user, message: "User registered successfully!"});
                    });
                }
            );
        } else {
            Role.findOne({name: "user"}, (err, role) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }

                user.roles = [role._id];
                user.save((err, user) => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                    res.send({message: "User registered successfully!"});
                });
            });
        }
    });
};


