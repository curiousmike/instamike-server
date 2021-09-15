const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    name: { type: String, required: true },
    timeStamp: { type: Number, default: Date.now()},
    description: { type: String, required: true },
    likes: [{ type: String, required: true }],
    comments: [{ type: String, required: true }],
    image: { type: String, required: true },
}, { collection: 'posts'});


const model = mongoose.model('PostModel', PostSchema);

module.exports = model;