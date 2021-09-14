const express = require('express')
const path = require('path')
const app = express();
const bodyParser = require('body-parser');
// mongoose is a "wrapper" for mongodb
const mongoose = require('mongoose')
const UserModel = require('./models/instamike');


const mongoAtlasPassword = 'TsYSzfJ7Y98N2Ew';
mongoose.connect(`mongodb+srv://mcoustier:${mongoAtlasPassword}@cluster0.1mm3m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`).then (
    () => console.log("connected to mongoDB"))
    .catch(
        (err)=> {console.log('monogdb connect error = ', err)
})

app.use('/', express.static(path.resolve(__dirname, 'assets')))
app.use(bodyParser.json({limit: '5mb'}));

// CR_U_D - UPDATE USER
app.post('/api/modify/user', async (req, res) => {
    const oldUser = req.body.oldData;
    const updatedUser = req.body.updatedData;
    const response = await UserModel.updateOne({
        userName: oldUser.name
    }, {
        $set: {
            name: updatedUser.name,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            password: updatedUser.password,
            description: updatedUser.description,
            avatar: updatedUser.avatar
        }
    })
    console.log('modify response = ', response);
    res.json({status: 'ok modify'});
});

// C_R_UD - READ USER
app.get('/api/get/user', async (req, res) => {
    const key = req.query.key;
    const value = req.query.value;
    console.log(`GET\nkey: ${key}\nvalue:${value}`);
    const records = await UserModel.find({[key]: value});   // this 
    res.json(records);
});

app.get('/api/get', async (req, res) => {
    const records = await UserModel.find({});
    res.json(records);
});

// _C_RUD - Create USER
app.post('/api/create/user', async (req, res) => {
	const record = req.body;
    // // Create (CRUD)
    const response = await UserModel.create(record);
	// console.log('Created new user = ', response);
	res.json({ status: 'ok' })
})

const port = 4000;
const ipAddress = '127.0.0.1';
app.listen(port, ipAddress, () => {
	console.log(`Server up ${ipAddress}:${port}`);
})