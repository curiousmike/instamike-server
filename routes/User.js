const sharp = require("sharp"); // for image resizing
const UserModel = require("../models/UserModel");
const fs = require("fs");
const determineResize = require("../utils/utils");

const express = require("express");
const userRouter = express.Router();
//
//
// USER FUNCTIONS
//
//

// CR_U_D - UPDATE USER
userRouter.post("/modify", async (req, res) => {
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
userRouter.get("/exists", async (req, res) => {
  const key = req.query.key;
  const value = req.query.value;
  const records = await UserModel.find({ [key]: value }); // this
  res.json(records);
});

// Get all users
userRouter.get("/", async (req, res) => {
  const records = await UserModel.find({}).sort({ timeStamp: -1 });
  res.json(records);
});

// _C_RUD - Create USER
userRouter.post("/", async (req, res) => {
  const record = req.body;

  // setup path for this new user
  const yourPath = `/binary/user/${record.name}`;
  console.log("\n\ncreate user = ", record.name);
  fs.mkdir("../instamike/public" + yourPath, (err) => {
    if (err) {
      return console.error("create user create his folder error = ", err);
    }
    console.log("Directory created successfully!");
  });
  //
  //
  let data = Buffer.from(record.avatar, "base64");
  let finalData = new Buffer.alloc(data.length - 15);
  data.copy(finalData, 0, 15, data.length); // Mystery - for some reason, when doing the buffer.from base64 above, I get an extra 15 bytes at beginning of result. Strip those here.
  const yourPathSimple = yourPath;
  const fileName = `${yourPathSimple}/avatar.jpg`;
  const fileNameSmall = `${yourPathSimple}/avatar-medium.jpg`;
  const fileNameMedium = `${yourPathSimple}/avatar-small.jpg`;
  record.avatarFileName = fileName;
  record.avatarFileNameMedium = fileNameMedium;
  record.avatarFileNameSmall = fileNameSmall;

  console.log("fileName  ", fileName);
  fs.writeFile("../instamike/public/" + fileName, finalData, (err) => {
    if (err) {
      console.log("Avatar error writing = ", err);
    } else {
      console.log("Avatar Original quality imagefile written success!");
    }
  });

  const { width, height } = await sharp(finalData).metadata();
  const { smallSize, mediumSize } = determineResize(width, height);
  sharp(finalData)
    .resize(smallSize)
    .withMetadata()
    .toBuffer()
    .then((smallData) => {
      fs.writeFile("../instamike/public/" + fileNameSmall, smallData, (err) => {
        if (err) {
          console.log("Avatar error writing = ", err);
        }
      });
    });

  sharp(finalData)
    .resize(mediumSize)
    .withMetadata()
    .toBuffer()
    .then((mediumData) => {
      fs.writeFile(
        "../instamike/public/" + fileNameMedium,
        mediumData,
        (err) => {
          if (err) {
            console.log("Avatar error writing = ", err);
          } else {
            console.log("Avatar medium imagefile written success!");
          }
        }
      );
    });

  doUserCreate(record, res, fileName, fileNameSmall, fileNameMedium);
});

const doUserCreate = async (
  record,
  res,
  avatarFileName,
  avatarFileNameSmall,
  avatarFileNameMedium
) => {
  await UserModel.create(record);
  res.json({
    status: 200,
    fileNames: {
      full: avatarFileName,
      small: avatarFileNameSmall,
      medium: avatarFileNameMedium,
    },
  });
};

module.exports = userRouter;
