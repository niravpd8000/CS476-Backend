// UserModel.js

const BaseModel = require("./BaseModel");

class UserModel extends BaseModel {
    constructor() {
        super("User", {
            fullName: String,
            username: String,
            email: String,
            password: String,
            roles: [],
        });

        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    async create(data) {
        const result = await super.create(data);
        this.notifyObservers();
        return result;
    }

    async update(id, data) {
        const result = await super.update(id, data);
        this.notifyObservers();
        return result;
    }

    notifyObservers() {
        this.observers.forEach(observer => observer.update());
    }
}

module.exports = UserModel;
