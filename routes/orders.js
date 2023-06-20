const {Router} = require('express');
const Order = require('../models/order');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({'user.userId': req.user._id}).populate('user.userId');

        res.render('orders', {
            isOrder: true,
            title: 'Orders',
            orders: orders.map(e => {
                return {
                    ...e._doc,
                    price: e.courses.reduce((total, e) => {
                        return total += e.count * e.course.price
                    }, 0)
                }
            })
        });
    } catch (err) {
        console.log(err);
    }
});

router.post('/', auth, async (req, res) => {
    try {      
        const user = await req.user.populate('cart.items.courseId');

        const courses = user.cart.items.map(e => ({
            count: e.count,
            course: {...e.courseId._doc}
        }));
        
        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses: courses
        });

        await order.save();
        await req.user.clearCart();

        res.redirect('/orders');
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
