const express = require('express')
const path = require('path')
const app = express();
const bodyParser = require('body-parser');
// mongoose is a "wrapper" for mongodb
const mongoose = require('mongoose')
const UserModel = require('./models/UserModel');
const PostModel = require('./models/PostModel');

//
//
// SETUP
//
//
const mongoAtlasPassword = 'TsYSzfJ7Y98N2Ew';
mongoose.connect(`mongodb+srv://mcoustier:${mongoAtlasPassword}@cluster0.1mm3m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`).then (
    () => { 
        const port = 4000;
        const ipAddress = '127.0.0.1';
        app.listen(port, ipAddress, () => {
            console.log(`Server up ${ipAddress}:${port}`);
        })
        console.log("connected to mongoDB") 
    })
    .catch(
        (err)=> {console.log('monogdb connect error = ', err)
})

app.use('/', express.static(path.resolve(__dirname, 'assets')))
app.use(bodyParser.json({limit: '5mb'}));

//
//
// USER FUNCTIONS
//
//

// CR_U_D - UPDATE USER
app.post('/api/modify/user', async (req, res) => {
    const oldUser = req.body.oldData;
    const updatedUser = req.body.updatedData;
    console.log('\n\n\nMODIFY user =', oldUser.name, oldUser._id);
    const response = await UserModel.findOneAndUpdate(
        { 
            _id: oldUser._id 
        }, 
        {
            $set: {
                name: oldUser.name,
                firstName: updatedUser.firstName, // OLD - non mod
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                phone: updatedUser.phone,
                password: oldUser.password, // OLD - non mod
                description: updatedUser.description,
                avatar: updatedUser.avatar,
                followers: updatedUser.followers,
                following: updatedUser.following,
            },
        },
        {
            returnOriginal: false,  // default is to return document as it was BEFORE update
        }
    )
    res.json({status: 'ok'});
});

// C_R_UD - READ USER
app.get('/api/get/user', async (req, res) => {
    const key = req.query.key;
    const value = req.query.value;
    console.log('\n\nGET user = ', key ,value);
    const records = await UserModel.find({[key]: value});   // this 
    res.json(records);
});

// Get all users
app.get('/api/get', async (req, res) => {
    console.log('\n\nGET userS');
    const records = await UserModel.find({}).sort({'timeStamp': -1});
    res.json(records);
});

// _C_RUD - Create USER
app.post('/api/create/user', async (req, res) => {
    console.log('\n\n\nCREATE user ');
	const record = req.body;
    const response = await UserModel.create(record);
	res.json({ status: 200 })
})

//
//
// POSTS functions
//
//
app.get('/api/get/posts', async (req, res) => {
    console.log('\n\n\nGET posts ');
    const records = await PostModel.find({}).sort({'timeStamp': -1});
    res.json(records);
});

app.post('/api/create/post', async (req, res) => {
    console.log('\n\n\nCREATE post ');
	const record = req.body;
    // // Create (CRUD)
    const response = await PostModel.create(record);
	res.json({ status: 'ok' })
})

app.post('/api/delete/post', async (req, res) => {
    const record = req.body;
    console.log('\nDELETE - ', record);
    const response = await PostModel.deleteOne(record);
    console.log('records = ', response);
    res.json({status: 'ok'});
});
