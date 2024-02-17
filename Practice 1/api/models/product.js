const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    // Giving each of these a data type
    // _id has the Id that mongoose provides
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true},
    price: { type: Number, required: true},
    productImage: { type: String, required: true }
});

// The first paramenter is the name of the model you want to use, the second argument is the schema i want to use
module.exports = mongoose.model('Product', productSchema);