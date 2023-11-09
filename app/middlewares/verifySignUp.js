const db = require("../models");
const ModelFactory = require('../ModelFactory');
const userModel = ModelFactory.createModel('User');
const ROLES = db.ROLES;


checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {
        // Check for duplicate username
        const userWithUsername = await userModel.findOne({username: req.body.username.toLowerCase()});
        if (userWithUsername) {
            return res.status(400).send({message: "Username is already in use!"});
        }

        // Check for duplicate email
        const userWithEmail = await userModel.findOne({email: req.body.email.toLowerCase()});
        if (userWithEmail) {
            return res.status(400).send({message: "Email is already in use!"});
        }

        next();
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};


checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                res.status(400).send({
                    message: `Failed! Role ${req.body.roles[i]} does not exist!`
                });
                return;
            }
        }
    }

    next();
};

const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
};

module.exports = verifySignUp;
