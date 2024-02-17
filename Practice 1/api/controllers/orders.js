const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');

exports.orders_get_all = (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        // The reference which i want to populate the date with, like below of product, i want its information not just id
        // Second parameter is the properties i want to populate this with
        // Note: in order.js i had linked product variable with Product, so here i am using the variable name i am populating that was linked
        .populate('product', 'name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                })
                
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
};

exports.orders_create_order = (req, res, next) => {
    Product.findById(req.body.product)
        .then(product => {
            if (!product) 
            {
                return res.status(404).json({
                    message: "Product not found"
                })
            }
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.product
            });
            return order.save()
        })
        .then(result => {
            console.log(result),
            res.status(201).json({
                message: "Order stored",
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity                    
                },
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/orders/${result._id}`
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.orders_get_order = (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .select('product quantity _id')
        .populate('product')
        .exec()
        .then(doc => {
            if (doc)
            {
                res.status(400).json({
                    order: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + id
                    }
                })
            }
            else {
                res.status(404).json({
                    message: "No valid entry found for provided ID"
                })
            }
        })
        .catch(err => {
            res.status(500).json({error: err});
        })
};

exports.orders_delete = (req, res, next) => {
    const id = req.params.orderId;
    Order.deleteOne({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Order Deleted",
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/orders',
                    body: { productID: 'ID', quantity: 'Number'}
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
};