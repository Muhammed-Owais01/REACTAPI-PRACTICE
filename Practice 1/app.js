// Importing express
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(morgan('dev'));
// New middle for uploads, the static function makes folder publicly available
// the /uploads tells it to parse requests at uploads folder
app.use('/uploads',express.static('uploads')); 
// Parses urlencoded, extended true means more rich data
app.use(bodyParser.urlencoded({extended: false}));
// Extracts json data and makes it easily readable to us
app.use(bodyParser.json());


// HANDLING CORS
app.use((req, res, next) => {
    // wherever i send a response, it adjusts to have these headers
    // * means to give access to any origin
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        // The headers we want to accept
        "Access-Control-Allow-Headers", 
        // Headers
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    )
    // Browser sends an OPTIONS request first when we send a POST PUT PATCH DELETE GET request
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        // If we have an options request then we must send the return
        return res.status(200).json({});
    }
    next();
})

// Importing the routes
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

// MONGODB
mongoose.connect(
    'mongodb+srv://mowais:' + 
    process.env.MONGO_ATLAS_PW + 
    '@node-rest-shop.pyzhulp.mongodb.net/?retryWrites=true&w=majority',
    {
        // It will use the mongodb client for connecting
        //useMongoClient: true SO TURNS OUT WE DONT NEED TO USE THIS IN THE NEW MONGOOSE UPDATE
    }
);
mongoose.Promise = global.Promise;

// Any requests from /products will be handled by productRoutes
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

// Here we create an error
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    // This will forward the error request
    next(error);
})

// Catches error from any where
app.use((error, req, res, next) => {
    // if cant get the error status (404 that we stored) then do 500
    res.status(error.status || 500);
    res.json({
        error: {
            // error.message is already present in the object error, we dont need to specify it as we did above by adding 'Not Found'
            message: error.message
        }
    })
})

// Exporting the app so we can use it in other files
module.exports = app; 