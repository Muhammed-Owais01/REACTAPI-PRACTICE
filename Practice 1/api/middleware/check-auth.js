const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // basically wherever we put this verify, it will check if there is a token there and decode it
    // if there is no token then obviously the verification fails
    try {
        // split(" ")[1] basically splits the token by looking if there is a space and then takes the string next to the space, so [1](as it goes 0 then 1 then 2)
        // therefore the word Bearer is removed from the token
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        // doing this would allow us to extra userData from request, here we created a new variable in req name userData
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Auth Failed"
        })
    }
};