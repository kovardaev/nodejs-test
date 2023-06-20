const {Router} = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');
const {registerValidators} = require('../utils/validators')
const nodemailer = require('nodemailer');
const mailgun = require('nodemailer-mailgun-transport');
const keys = require('../keys');
const regEmail = require('../emails/registration'); 
const resetEmail = require('../emails/reset'); 
const crypto = require('crypto');

const router = Router();

const transporter = nodemailer.createTransport(mailgun({
    auth: {
        api_key: keys.MAILGUN_API_KEY,
        domain: keys.MAILGUN_DOMAIN
    }
}));

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Logging in',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    });
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    });  
});

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const candidate = await User.findOne({email});

        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password);
            
            if (areSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if (err) {
                        throw err;
                    }
                    res.redirect('/');                 
                });    
            } else {
                req.flash('loginError', 'Incorrect password.');
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('loginError', 'User with this email not found.');
            res.redirect('/auth/login#login');
        }
    } catch (err) {   
        console.log(err); 
    }  
});

router.post('/register', registerValidators, async (req, res) => {
    try {
        const {email, password, name} = req.body;
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg);
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email, name, password: hashPassword, cart: {items: []}
        });

        await user.save();
        res.redirect('/auth/login#login');
        await transporter.sendMail(regEmail(email));   
    } catch (err) { 
        console.log(err);
    }
});

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Forgot password?',
        error: req.flash('error')
    });
});

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login');
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        });   
        
        if (!user) {
            return res.redirect('/auth/login');
        } else {
            res.render('auth/password', {
                title: 'Restore access',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            });
        }
    } catch (err) {
        console.log(err);
    }

    
});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Something went wrong, please try again.');
                return res.redirect('/auth/reset');
            }

            const token = buffer.toString('hex');
            const candidate = await User.findOne({email: req.body.email});

            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
                await candidate.save();
                await transporter.sendMail(resetEmail(candidate.email, token));
                res.redirect('/auth/login');
            } else {
                req.flash('error', 'User with this email not found.');
                return res.redirect('/auth/reset');
            }
        });
    } catch (err) {
        console.log(err);
    }
});

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        }); 

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login');
        } else {
            req.flash('loginError', 'Token expired');
            res.redirect('/auth/login');
        }
    } catch (err) {
        console.log('err');
    }
});

module.exports = router;
