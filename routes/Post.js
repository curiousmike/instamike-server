const sharp = require("sharp"); // for image resizing
const PostModel = require("../models/PostModel");
const fs = require("fs");

const express = require("express");
const postRouter = express.Router(); //

//
//
// POSTS functions
//
//

postRouter.get("/", async (req, res) => {
  const records = await PostModel.find({}).sort({ timeStamp: -1 });
  res.json(records);
});

// Create new post
//
postRouter.post("/create", async (req, res) => {
  const timeStamp = Date.now();

  const record = req.body;
  const yourPath = `binary/user/${record.name}`;
  record.fileName = `${yourPath}/${timeStamp}-image.jpg`;
  record.fileNameMedium = `${yourPath}/${timeStamp}-image-medium.jpg`;
  record.fileNameSmall = `${yourPath}/${timeStamp}-image-small.jpg`;

  let data = Buffer.from(record.image, "base64");
  let finalData = new Buffer.alloc(data.length - 15);
  data.copy(finalData, 0, 15, data.length); // Mystery - for some reason, when doing the buffer.from base64 above, I get an extra 15 bytes at beginning of result. Strip those here.
  console.log("written to ", "../instamike/public/" + record.fileName);
  fs.writeFile("../instamike/public/" + record.fileName, finalData, (err) => {
    if (err) {
      console.log("error writing = ", err);
    } else {
      console.log("Original quality imagefile written success!");
    }
  });

  const smallSize = 256;
  const mediumSize = 512;
  sharp(finalData)
    .resize(smallSize)
    .toBuffer()
    .then((smallData) => {
      fs.writeFile(
        "../instamike/public/" + record.fileNameSmall,
        smallData,
        (err) => {
          if (err) {
            console.log("error writing = ", err);
          }
        }
      );
    });

  sharp(finalData)
    .resize(mediumSize)
    .toBuffer()
    .then((mediumData) => {
      fs.writeFile(
        "../instamike/public/" + record.fileNameMedium,
        mediumData,
        (err) => {
          if (err) {
            console.log("error writing = ", err);
          } else {
            console.log("medium imagefile written success!");
          }
        }
      );
    });
  console.log("Post created.\n\n");
  return doPostCreate(res, record);
});

const doPostCreate = async (res, record) => {
  const response = await PostModel.create(record);
  return res.json({
    statusText: "ok",
    fileNames: {
      full: record.fileName,
      small: record.fileNameSmall,
      medium: record.fileNameMedium,
    },
  });
};

postRouter.post("/delete", async (req, res) => {
  const record = req.body;
  const response = await PostModel.deleteOne(record);
  console.log("records = ", response);
  res.json({ status: "ok" });
});

// CR_U_D - UPDATE POST
postRouter.post("/modify", async (req, res) => {
  const oldPost = req.body.oldData;
  console.log("updated = ", req.body.updatedData);
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

module.exports = postRouter;
