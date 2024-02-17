const mongoose = require('mongoose');
// encryption
const bcrypt = require('bcrypt');
// token
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.user_signup = (req, res, next) => {
    // Making sure same emails are not entered more than once
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            // for matching emails we have length >= 1 however for no matching emails its zero
            if (user.length >= 1) 
            {
                return res.status(409).json({
                    message: "Mail Exists"
                });
            } else {
                // second parameter is Salt (we add random strings to the plain password before we hash it) and then the added strings are also stored in the hash
                // (err, hash) is the cb
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err)
                    {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User ({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "User Created"
                                });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                })
            }
        })
 };

 exports.user_login = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(users => {
            // if we got no users
            if (users.length < 1)
            {
                return res.status(401).json({
                    message: "Authorization Failed"
                });
            }
            // comparing entered pass with stored pass
            bcrypt.compare(req.body.password, users[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Authorization Failed"
                    });
                }
                // if it matches then make a token and give a success msg
                if (result) {
                    // Making token for authentication
                    const token = jwt.sign(
                    {
                        email: users[0].email,
                        userId: users[0]._id
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    });
                    return res.status(200).json({
                        message: "Auth Successful",
                        token: token
                    });
                }
                res.status(401).json({
                    message: "Authorization Failed"
                });
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
};

exports.user_delete = (req, res, next) => {
    const id = req.params.userId;
    User.deleteOne({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User Deleted"
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
 };