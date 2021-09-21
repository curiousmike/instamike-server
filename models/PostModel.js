const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    comment:{ type: String, required: true },
    poster:{ type: String, required: true },
    likes: [{ type: String, required: true }],  // array of userid's who like this
    timeStamp: { type: Number, default: Date.now()},
});

const PostSchema = new mongoose.Schema({
    name: { type: String, required: true },         // user who posted it
    timeStamp: { type: Number, default: Date.now()},// timestamp
    description: { type: String, required: true },  // the description of the post
    likes: [{ type: String, required: true }],      // array of users who liked it
    comments: {type: [CommentSchema]},              // array of comments
    image: { type: String, required: true },        // the image data - TODO: array of images?
}, { collection: 'posts'});


const model = mongoose.model('PostModel', PostSchema);

module.exports = model;