const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");

const app = express();

var corsOptions = {
    origin: '*',
    methods: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

// app.use(cors(corsOptions));
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({extended: true}));

const db = require("./app/models");

const ModelFactory = require('./app/ModelFactory');
const RoleModel = ModelFactory.createModel('Role');

db.mongoose
    .connect(`mongodb+srv://niravmongo:Zaza@711@cluster0.20jv1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
        // initialRoles();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });


// routes
require("./app/routes/user.routes")(app);
require("./app/routes/rest.routes")(app);
require("./app/routes/order.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

// function initialRoles() {
//     // Use the ModelFactory to get the Role model
//
//
//     RoleModel.estimatedDocumentCount((err, count) => {
//         if (!err && count === 0) {
//             const roles = [
//                 { name: 'user' },
//                 { name: 'moderator' },
//                 { name: 'admin' }
//             ];
//
//             // Use Promise.all to save all roles
//             Promise.all(roles.map(role => new RoleModel(role).save()))
//                 .then(savedRoles => {
//                     console.log('Added roles to roles collection:', savedRoles);
//                 })
//                 .catch(err => {
//                     console.error('Error adding roles:', err);
//                 });
//         }
//     });
// }
//
