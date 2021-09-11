const express = require('express')
const path = require('path')
const app = express();
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

// CR_U_D
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

// C_R_UD
app.post('/api/get', async (req, res) => {
    console.log('get called');
    const records = await UserModel.find({});   // this says: Give me everything
    // const records = await UserModel.find({userName: 'mike'}); // every record with name == 'mike'
    //.findOne({userName: 'mike'})
    res.json(records);
});
// _C_RUD
app.post('/api/create', async (req, res) => {
	const record = req.body
	console.log(record)
    res.json({ status: 'ok mike'});
    // Create (CRUD)
    // response is from Mongodb server
    const response = await UserModel.create(record);
	console.log(response)

	// res.json({ status: 'ok' })
})

const port = 13371;
const ipAddress = 'localhost';
app.listen(port, ipAddress, () => {
	console.log(`Server up ${ipAddress}:${port}`);
})