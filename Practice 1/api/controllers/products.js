const mongoose = require('mongoose');
const Product = require('../models/product');

exports.products_get_all = (req, res, next) => {
    // finds anything 
    Product.find()
        // The fields we want to fetch
        .select('name price _id productImage')
        // exec() executes the query
        .exec()
        .then(docs => {
            const response = {
                // counts stores the number of products we have
                count: docs.length,
                // products stores the docs data (that is name and price here and more if i add in future to it)
                // map now makes it into an array
                products: docs.map(doc => {
                    return {
                        // returning the name price and id
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
                        // meta data that i am providing, its upto me what i provide
                        request: {
                            type: 'GET',
                            // appends the id at the end of the products
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            };
            // if (docs.length >= 0)
            // {
                res.status(200).json(response);
            // }
            // else {
            //     res.status(404).json({
            //         message: "No entries found"
            //     })
            // }
            
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
};

exports.products_create_product = (req, res, next) => {
    // We now have .file in req due to upload.single()
    // console.log(req.file);
    // Creating a new product as a JS object
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        // Can extract different properties from body, depending on the data i receive
        name: req.body.name,
        price: req.body.price,
        // path of the file
        productImage: req.file.path
    });
    // save is a method provided by mongoose to be used on mongoose models, it then stores it in the database
    product.save()
        // Then is the success of my call, so when it success i do json immediately
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Created product successfully',
                // response json, passed the product object
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result.id,
                    request: {
                        type: "GET",
                        url: "http://localhost:3000/" + result._id
                    }
                }
            });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
};

exports.products_get_product = (req, res, next) => {
    // params is an object with all the parameters we have
    // productId is passed in the link after product/
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        // exec() executes the query
        .exec()
        // Handles the result of the query. If a document is found, it gets passed to the callback function as doc
        .then(doc => {
            // Outputs in the terminal
            console.log("From database", doc);
            // In case of a valid doc that is a valid id being found
            if (doc)
            {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + doc._id
                    }
                });
            } else {
                res.status(404).json({message: "No valid entry found for provided ID"});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
};

exports.products_update_product = (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body)
    {
        // propName would rn be name or price
        // value would be the value of these name and price
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({ _id: id}, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message : "Product Updated",
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.product_delete = (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Product Deleted",
                request: {
                    type: 'POST',
                    url: "http://localhost:3000/products",
                    body: { name: 'String', price: 'Number' }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
};