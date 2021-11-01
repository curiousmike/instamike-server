const express = require('express')
const path = require('path')
const app = express();
const bodyParser = require('body-parser');
// mongoose is a "wrapper" for mongodb
const mongoose = require('mongoose');
const UserModel = require('./models/UserModel');
const PostModel = require('./models/PostModel');

const jsftp = require('jsftp'); // for ftp transfer
const sharp = require('sharp'); // for image resize
// SETUP

const mongoAtlasPassword = 'TsYSzfJ7Y98N2Ew';
mongoose
  .connect(
    `mongodb+srv://mcoustier:${mongoAtlasPassword}@cluster0.1mm3m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  )
  .then(() => {
    const port = 4000;
    const ipAddress = '127.0.0.1';
    app.listen(port, ipAddress, () => {
      console.log(`Server up ${ipAddress}:${port}`);
    });
    console.log('connected to mongoDB');
  })
  .catch((err) => {
    console.log('monogdb connect error = ', err);
  });

app.use('/', express.static(path.resolve(__dirname, 'assets')));
app.use(bodyParser.json({ limit: '10mb' }));

//
// FTP setup
//
const FTP = new jsftp({
  host: 'www.coustier.com',
  port: 21,
  user: 'couszmiz',
  pass: 'Tigerwoods1729!',
});

const ftpUserPostRootPath = '/public_html/instamike/binary/user/posts';
const ftpUserPostRootPathSimple = '/instamike/binary/user/posts';
// FTP.list(ftpUserPostRootPath, (err, res) => {
//   console.log('res', res);
// });

// console.log('FTP = ', FTP);

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
      _id: oldUser._id,
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
        notifications: updatedUser.notifications,
        blocked: updatedUser.blocked,
      },
    },
    {
      returnOriginal: false, // default is to return document as it was BEFORE update
    }
  );
  res.json({ status: 'ok' });
});

// C_R_UD - READ USER
app.get('/api/get/user', async (req, res) => {
  const key = req.query.key;
  const value = req.query.value;
  console.log('\n\nGET user = ', key, value);
  const records = await UserModel.find({ [key]: value }); // this
  res.json(records);
});

// Get all users
app.get('/api/get', async (req, res) => {
  console.log('\n\nGET userS');
  const records = await UserModel.find({}).sort({ timeStamp: -1 });
  res.json(records);
});

// _C_RUD - Create USER
app.post('/api/create/user', async (req, res) => {
  console.log('\n\n\nCREATE user ');
  const record = req.body;
  const response = await UserModel.create(record);
  res.json({ status: 200 });
  const yourPath = `${ftpUserPostRootPath}/${record.name}`;
  FTP.raw('mkd', yourPath, (err, data) => {
    if (err) {
      return console.error(err);
    }
    console.log(data.text); // Show the FTP response text to the user
    console.log(data.code); // Show the FTP response code to the user
  });
});

//
//
// POSTS functions
//
//
app.get('/api/get/posts', async (req, res) => {
  console.log('\n\n\nGET posts ', req);
  const records = await PostModel.find({}); //.sort({ timeStamp: -1 });
  console.log('\n\n\n\n\nrecords = ', records);
  res.json(records);
});

app.post('/api/create/post', async (req, res) => {
  // removing this comment causes Date.now to make this function wonky
  const timeStamp = Date.now();
  const record = req.body;
  const yourPath = `${ftpUserPostRootPathSimple}/${record.name}`;
  const fileName = `${yourPath}/${timeStamp}-image.jpg`;
  const fileNameSmall = `${yourPath}/${timeStamp}-image-small.jpg`;
  record.fileName = fileName; // is it really a jpg?
  record.fileNameSmall = fileNameSmall;
  // // Create (CRUD)
  const response = await PostModel.create(record);
  res.json({ status: 'ok' });

  // copy to ftp
  let data = Buffer.from(record.image, 'base64');
  let finalData = new Buffer.alloc(data.length - 15);
  data.copy(finalData, 0, 15, data.length); // Mystery - for some reason, when doing the buffer.from base64 above, I get an extra 15 bytes at beginning of result. Strip those here.
  // const resizedData = sharp(finalData).resize(256, 256);
  // console.log('resize = ', resizedData);
  const uploadPathPlusFilename = `${ftpUserPostRootPath}/${record.name}/${timeStamp}-image.jpg`;
  // console.log('fullpath = ', uploadPathPlusFilename);
  FTP.put(finalData, uploadPathPlusFilename, (err) => {
    if (!err) {
      console.log('image upload!');
    } else {
      console.log('\n\n\nFTP put image error = ', err);
    }
  });
});

app.post('/api/delete/post', async (req, res) => {
  const record = req.body;
  console.log('\nDELETE - ', record);
  const response = await PostModel.deleteOne(record);
  // console.log('records = ', response);
  res.json({ status: 'ok' });
});

// CR_U_D - UPDATE POST
app.post('/api/modify/post', async (req, res) => {
    const oldPost = req.body.oldData;
    const updatedPost = req.body.updatedData;
    console.log('\n\n\nMODIFY post =', updatedPost.comments);
    const response = await PostModel.findOneAndUpdate(
        { 
            _id: oldPost._id 
        }, 
        {
            $set: {
                description: updatedPost.description,
                likes: updatedPost.likes,
                comments: updatedPost.comments,
            },
        },
        {
            returnOriginal: false,  // default is to return document as it was BEFORE update
        }
    )
    console.log('res', response)
    res.json({status: 'ok'});
});
