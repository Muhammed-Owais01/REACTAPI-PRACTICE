const express = require('express');
const router = express.Router();
// for uploading images
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const ProductsController = require('../controllers/products');

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

/* Because we did app.use('/products', productRoutes), now we dont write /products in the routes, as this 
would become /products/products. it now targets it through productRoutes.    
This way we are able to divide our code into separate files
*/
// The first parameter is us telling which url/route we want to handle. 
router.get('/', ProductsController.products_get_all);

// productImage is the variable which will hold the file
// checkAuth first checks if the token matches then it lets the user post
router.post('/', checkAuth, upload.single('productImage'), ProductsController.products_create_product);

// Handling requests for particular ids
router.get('/:productId', ProductsController.products_get_product);

router.patch('/:productId', checkAuth, ProductsController.products_update_product);

router.delete('/:productId', checkAuth, ProductsController.product_delete);

// Now exporting this router so we can use it in other files
module.exports = router;