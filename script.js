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
app.use(bodyParser.json());
// CR_U_D - UPDATE
app.post('/api/modify', async (req, res) => {
    const { oldName: oldName, newName: newName } = req.body;
    const response = await UserModel.updateOne({
        userName: oldName
    }, {
        $set: {
            userName: newName
        }
    })
    console.log('modify response = ', response);
    res.json({status: 'ok modify'});
});

// C_R_UD - READ
app.get('/api/get/user', async (req, res) => {
    const key = req.query.key;
    const value = req.query.value;
    console.log(`GET\nkey: ${key}\nvalue:${value}`);
    const records = await UserModel.find({[key]: value});   // this 
    res.json(records);
});

// _C_RUD - Create
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