const {body} = require('express-validator');
const User = require('../models/user');

const registerValidators = [
    body('email')
        .isEmail()
        .withMessage('Enter a valid email address').custom(async (value, { req }) => {
            try {
                const candidate = await User.findOne({ email: value });
                if (user) {
                    return Promise.reject('Email is already in use');
                }
            } catch (err) {
                console.log(err);
            }
        })
        .normalizeEmail(),

    body('password', 'Password must be at least 6 characters long')
        .isLength({min: 6, max: 56})    
        .isNumeric()
        .trim(),

    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }  
            return true;  
        })
        .trim(),

    body('name')
        .isLength({min: 3})
        .withMessage('Name must be at least 3 characters long')
        .trim()
];

const courseValidators = [
    body('title')
        .isLength({min: 3})
        .withMessage('Title must be at least 3 characters long')
        .trim(),
        
    body('price')
        .isNumeric()
        .withMessage('Enter correct price'),

    body('image', 'Enter correct URL').isURL()
];

module.exports = {
    registerValidators,
    courseValidators
}
