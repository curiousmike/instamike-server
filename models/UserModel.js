const mongoose = require('mongoose');

const nestedObj = new mongoose.Schema({ 
    field1: String,
})


const UserSchema = new mongoose.Schema({
        name: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        description: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        password: { type: String, required: true },
        avatar: { type: String, required: true },
        posts: { type: Array, required: true }, 
        followers: { type: Array, required: true }, 
        following: { type: Array, required: true }, 
        timeStamp: { type: Number, default: Date.now()},
}, { collection: 'users'});


const model = mongoose.model('UserModel', UserSchema);

module.exports = model;