const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRouter = require("./routes/User");
const postRouter = require("./routes/Post");

mongoose.set("strictQuery", false);
dotenv.config();

//
//
// SETUP
//
//
mongoose
  .connect(
    `mongodb+srv://mcoustier:${process.env.MONGO_KEY}@cluster0.1mm3m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  )
  .then(() => {
    const port = 4000;
    const ipAddress = "127.0.0.1";
    app.listen(port, ipAddress, () => {
      console.log(`\n\nServer up ${ipAddress}:${port}\n\n------------------\n`);
    });
    console.log("\nConnected to mongoDB");
  })
  .catch((err) => {
    console.log("\n\n\n!!! Monogdb connect error = ", err);
  });

app.use("/", express.static(path.resolve(__dirname, "assets")));
app.use(bodyParser.json({ limit: "7mb" }));
app.use("/user", userRouter);
app.use("/post", postRouter);
