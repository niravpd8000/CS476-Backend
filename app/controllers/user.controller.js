const config = require("../config/auth.config");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");
const ModelFactory = require('../ModelFactory');
const userModel = ModelFactory.createModel('User');
const roleModel = ModelFactory.createModel('Role');
const restaurantModel = ModelFactory.createModel('Restaurant');

exports.signup = async (req, res) => {
    try {
        const {username, fullName, email, password} = req.body;

        const defaultRole = await roleModel.findOne({name: 'user'});
        const role = [defaultRole._id];
        const createdUser = await userModel.create({
            username: username?.toLowerCase(),
            fullName,
            email,
            password: bcrypt.hashSync(password, 8),
            roles: role
        });

        res.status(201).send({data: "createdUser", message: 'User registered successfully!'});
    } catch (err) {
        res.status(500).send({message: err.message});
    }
};
exports.signin = async (req, res) => {
    try {
        const {username, password} = req.body;

        const user = await userModel.findOne({username});

        if (!user) {
            return res.status(404).send({message: 'User Not found.'});
        }
        if (!user.password) {
            return res.status(401).send({message: 'User password is missing.'});
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: 'Invalid Password!',
            });
        }

        let tokenPayload = {
            id: user.id,
        };

        const restaurant = await restaurantModel.findOne({adminId: user.id});

        if (restaurant) {
            tokenPayload.restaurantId = restaurant._id;
        }

        const token = jwt.sign(tokenPayload, config.secret, {
            expiresIn: 86400, // 24 hours
        });
        res.status(200).send({
            id: user._id,
            username: user?.username,
            email: user?.email,
            fullName: user?.fullName,
            accessToken: token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({message: err.message});
    }
};

