const mongoose = require("mongoose");

class BaseModel {
    constructor(collectionName, schema) {
        this.Model = mongoose.model(collectionName, new mongoose.Schema(schema));
    }

    create(data) {
        const modelInstance = new this.Model(data);
        return modelInstance.save();
    }

    findById(id) {
        return this.Model.findById(id);
    }

    findOne(query) {
        return this.Model.findOne(query);
    }

    find(query) {
        return this.Model.find(query);
    }

    update(id, data) {
        return this.Model.findByIdAndUpdate(id, data, { new: true });
    }

    updateOne(query, data) {
        return this.Model.updateOne(query, data);
    }

    mapReduce(query){
        return this.Model.mapReduce(query);
    }

}

module.exports = BaseModel;
