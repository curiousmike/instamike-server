
const express = require("express");
const fs = require('fs')
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
// mongoose is a "wrapper" for mongodb
const mongoose = require("mongoose");
const UserModel = require("./models/UserModel");
const PostModel = require("./models/PostModel");
const sharp = require("sharp"); // for image resizing
//
//
// SETUP
//
//
const mongoAtlasPassword = "PmqueGSjn7uE8";
mongoose
  .connect(
    `mongodb+srv://mcoustier:${mongoAtlasPassword}@cluster0.1mm3m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  )
  .then(() => {
    const port = 4000;
    const ipAddress = "127.0.0.1";
    app.listen(port, ipAddress, () => {
      console.log(`Server up ${ipAddress}:${port}\n\n------------------\n`);
    });
    console.log("connected to mongoDB");
  })
  .catch((err) => {
    console.log("monogdb connect error = ", err);
  });

app.use("/", express.static(path.resolve(__dirname, "assets")));
app.use(bodyParser.json({ limit: "7mb" }));

const ftpUserAvatarRootPath = "/public_html/instamike/binary/user/avatar";
const ftpUserAvatarRootPathSimple = "/instamike/binary/user/avatar";

//
//
// USER FUNCTIONS
//
//

// CR_U_D - UPDATE USER
app.post("/api/modify/user", async (req, res) => {
  const oldUser = req.body.oldData;
  const updatedUser = req.body.updatedData;
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
        blocked: updatedUser.blocked,
        notifications: updatedUser.notifications,
      },
    },
    {
      returnOriginal: false, // default is to return document as it was BEFORE update
    }
  );
  res.json({ status: "ok" });
});

// C_R_UD - READ USER
app.get("/api/get/user", async (req, res) => {
  const key = req.query.key;
  const value = req.query.value;
  console.log("\n\nGET user = ", key, value);
  const records = await UserModel.find({ [key]: value }); // this
  res.json(records);
});

// Get all users
app.get("/api/get", async (req, res) => {
  console.log("\n\nGET userS");
  const records = await UserModel.find({}).sort({ timeStamp: -1 });
  res.json(records);
});

// _C_RUD - Create USER
app.post("/api/create/user", async (req, res) => {
  console.log("\n\n\nCREATE user ", req.body);
  const record = req.body;

  // setup FTP path for this new user
  const yourPath = `/binary/user/${record.name}`
  console.log('\n\ncreate user = ', record.name)
  console.log('path = ', yourPath)
  // const yourPath = `${ftpUserAvatarRootPath}/${record.name}`;
  fs.mkdir('../instamike/public' + yourPath, (err) => {
    if (err) {
        return console.error('create user create his folder error = ',err);
    }
    console.log('Directory created successfully!');
  });
  //
  // 
  let data = Buffer.from(record.avatar, "base64");
  let finalData = new Buffer.alloc(data.length - 15);
  data.copy(finalData, 0, 15, data.length); // Mystery - for some reason, when doing the buffer.from base64 above, I get an extra 15 bytes at beginning of result. Strip those here.
  const yourPathSimple = yourPath 
  const fileName = `${yourPathSimple}/avatar.jpg`;
  const fileNameSmall = `${yourPathSimple}/avatar-medium.jpg`;
  const fileNameMedium = `${yourPathSimple}/avatar-small.jpg`;
  record.avatarFileName = fileName;
  record.avatarFileNameMedium = fileNameMedium;
  record.avatarFileNameSmall = fileNameSmall;

console.log('fileName  ', fileName)
console.log('fileNameSmall = ', fileNameSmall)
console.log('fileNameMedium = ', fileNameMedium)
  fs.writeFile("../instamike/public/" + fileName, finalData, (err) => {
    if (err) {
      console.log('Avatar error writing = ', err)
    } else {
      console.log('Avatar Original quality imagefile written success!')
    }
  })
  
  const smallSize = 256;
  const mediumSize = 512;
  sharp(finalData).resize(smallSize).toBuffer()
    .then((smallData) => {
      fs.writeFile("../instamike/public/" + fileNameSmall, smallData, (err) => {
        if (err) {
          console.log('Avatar error writing = ', err)
        }
      })
    });

  sharp(finalData).resize(mediumSize).toBuffer()
    .then((mediumData) => {
      fs.writeFile("../instamike/public/"+fileNameMedium, mediumData, (err) => {
        if (err) {
          console.log('Avatar error writing = ', err)
        } else {
          console.log('Avatar medium imagefile written success!')
        }
      })            
  });

  doUserCreate(record, res, fileName, fileNameSmall, fileNameMedium);

});

const doUserCreate = async (record, res, avatarFileName, avatarFileNameSmall, avatarFileNameMedium) => {
  console.log('\n\ndoUserCreate !  ')
  await UserModel.create(record);
  res.json({
    status: 200,
    fileNames: { full: avatarFileName, small: avatarFileNameSmall, medium: avatarFileNameMedium },
  });
}

//
//
// POSTS functions
//
//
app.get("/api/get/posts", async (req, res) => {
  const records = await PostModel.find({}).sort({ timeStamp: -1 });
  res.json(records);
});

//
// Create new post
// 
app.post("/api/create/post", async (req, res) => {
  const timeStamp = Date.now();

  const record = req.body;
    const yourPath = `binary/user/${record.name}`
    console.log('your path = ', yourPath)
    const fileName = `${yourPath}/${timeStamp}-image.jpg`;
    const fileNameMedium = `${yourPath}/${timeStamp}-image-medium.jpg`;
    const fileNameSmall = `${yourPath}/${timeStamp}-image-small.jpg`;
    record.fileName = fileName; // is it really a jpg?
    record.fileNameMedium = fileNameMedium;
    record.fileNameSmall = fileNameSmall;
  
    let data = Buffer.from(record.image, "base64");
    let finalData = new Buffer.alloc(data.length - 15);
    data.copy(finalData, 0, 15, data.length); // Mystery - for some reason, when doing the buffer.from base64 above, I get an extra 15 bytes at beginning of result. Strip those here.
    console.log('fileName created = ', record.fileName)
    console.log('and fully written to ', "../instamike/public/" + fileName)
    fs.writeFile("../instamike/public/" + fileName, finalData, (err) => {
      if (err) {
        console.log('error writing = ', err)
      } else {
        console.log('Original quality imagefile written success!')
      }
    })
    
    const smallSize = 256;
    const mediumSize = 512;
    sharp(finalData).resize(smallSize).toBuffer()
      .then((smallData) => {
        fs.writeFile("../instamike/public/" + fileNameSmall, smallData, (err) => {
          if (err) {
            console.log('error writing = ', err)
          }
        })
      });

    sharp(finalData).resize(mediumSize).toBuffer()
      .then((mediumData) => {
        fs.writeFile("../instamike/public/"+fileNameMedium, mediumData, (err) => {
          if (err) {
            console.log('error writing = ', err)
          } else {
            console.log('medium imagefile written success!')
          }
        })            
    });
    console.log('Post created.\n\n')
    return doPostCreate(res, record, fileName, fileNameSmall, fileNameMedium);

});

const doPostCreate = async (res, record, fileName, fileNameSmall, fileNameMedium) => {
  const response = await PostModel.create(record);
  return res.json({
    statusText: "ok",
    fileNames: { full: fileName, small: fileNameSmall, medium: fileNameMedium },
  });
}

app.post("/api/delete/post", async (req, res) => {
  const record = req.body;
  const response = await PostModel.deleteOne(record);
  console.log("records = ", response);
  res.json({ status: "ok" });
});

// CR_U_D - UPDATE POST
app.post("/api/modify/post", async (req, res) => {
  const oldPost = req.body.oldData;
  const updatedPost = req.body.updatedData;
  const response = await PostModel.findOneAndUpdate(
    {
      _id: oldPost._id,
    },
    {
      $set: {
        description: updatedPost.description,
        likes: updatedPost.likes,
        comments: updatedPost.comments,
      },
    },
    {
      returnOriginal: false, // default is to return document as it was BEFORE update
    }
  );
  console.log("res", response);
  res.json({ status: "ok" });
});
