const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    description: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    avatarFileName: { type: String, required: true },
    avatarFileNameSmall: { type: String, required: true },
    avatarFileNameMedium: { type: String, required: true },
    posts: { type: Array, required: true },
    followers: { type: Array, required: true },
    following: { type: Array, required: true },
    blocked: { type: Array, required: true },
    notifications: { type: Array, required: true },
    timeStamp: { type: Date, default: Date.now() },
  },
  { collection: 'users' }
);

const model = mongoose.model('UserModel', UserSchema);

module.exports = model;