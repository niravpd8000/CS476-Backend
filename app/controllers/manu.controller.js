const ModelFactory = require("../ModelFactory");
const manuModel = ModelFactory.createModel('Manu');

exports.createManu = async (req, res) => {
    const { name, description, price, estimate_time, additional_details, available, image_url } = req.body;

    try {
        const createdManu = await manuModel.create({
            name,
            description,
            price,
            estimate_time,
            additional_details,
            available,
            image_url,
            rest_id: req.rest_id
        });

        res.status(201).send(createdManu);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getAllManuByRestaurantId = async (req, res) => {
    try {
        const restaurantId = req.params.rest_id;

        const menuItems = await manuModel.find({ rest_id: restaurantId });

        if (!menuItems || menuItems.length === 0) {
            return res.status(200).send([]);
        }

        res.status(200).send(menuItems);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


exports.getManuItemById = async (req, res) => {
    try {
        const menuItemId = req.params.itemId;

        const menuItem = await manuModel.findById(menuItemId);

        if (!menuItem) {
            return res.status(404).send({ message: 'Manu item not found.' });
        }

        res.status(200).send(menuItem);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


exports.updateManuItemById = async (req, res) => {
    try {
        const menuItemId = req.body.itemId;
        const updatedManuItemData = req.body;

        const updatedManuItem = await manuModel.update(menuItemId, updatedManuItemData);

        if (!updatedManuItem) {
            return res.status(404).send({ message: 'Manu item not found.' });
        }

        res.status(200).send(updatedManuItem);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
