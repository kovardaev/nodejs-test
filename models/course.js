const {Schema, model} = require('mongoose');

const courseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true  
    },  
    image: String
});

courseSchema.method('toClient', function() {
    const course = this.toObject();
    course.id = course._id;

    return course;
})

module.exports = model('Course', courseSchema); 
