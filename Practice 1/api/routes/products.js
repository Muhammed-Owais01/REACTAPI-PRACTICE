const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// for uploading images
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    // request, file, callback
    // multer will execute these functions whenever a new file is released
    destination: function(req, file, cb) {
        // null bcz no error
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        // originalname is the actual name of the file i am using
        // we need .replace(/:/g, '-') so that ./uploads/ works
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // if file is png or jpeg then store the file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
    {
        // this will accept a file (it will store a file)
        cb(null, true);
    } else {
        // reject a file (it will ignore the file and not store it)
        // null because i dont want to throw an error, just not store the file
        cb(null, false);
    }
}

const upload = multer({
    storage: storage, 
    limits: {
        // limiting file size to 5 MB
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

const Product = require('../models/product');

/* Because we did app.use('/products', productRoutes), now we dont write /products in the routes, as this 
would become /products/products. it now targets it through productRoutes.    
This way we are able to divide our code into separate files
*/
// The first parameter is us telling which url/route we want to handle. 
router.get('/', (req, res, next) => {
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
});

// productImage is the variable which will hold the file
router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
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
});

// Handling requests for particular ids
router.get('/:productId', (req, res, next) => {
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
})

router.patch('/:productId', (req, res, next) => {
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
});

router.delete('/:productId', (req, res, next) => {
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
});

// Now exporting this router so we can use it in other files
module.exports = router;