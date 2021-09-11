const mongoose = require('mongoose');

const nestedObj = new mongoose.Schema({ 
    field1: String,
})


const UserSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    description: { type: String, required: true },
    timeStamp: { type: Number, default: Date.now(), 
    // _id <-- mongodb default key
    },
    // obj: nestedObj,
}, { collection: 'users'});

// {
//     record: 'a record',
//     date: 12345,
//     obj: {
//         field1: 'an object as a field'
//     }
// }

const model = mongoose.model('UserModel', UserSchema);

module.exports = model;