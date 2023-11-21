let express = require("express");
let path = require("path");
let fs = require("fs");
let MongoClient = require("mongodb").MongoClient;
let bodyParser = require("body-parser");
let app = express();
const PORT = 3000;
const mongoose = require("mongoose");

app.use(bodyParser.urlencoded({ extended: true })).use(bodyParser.json());

app.get("/", function (_, res) {
  const pathToFile = path.join(__dirname, "index.html");

  console.log(pathToFile);
  res.sendFile(pathToFile);
});

app.get("/profile-picture", function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
  res.writeHead(200, { "Content-Type": "image/jpg" });
  res.end(img, "binary");
});

// use when starting application locally
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";

// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@mongodb";

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "my-db";
// let databaseName = "user-account";

app.post("/update-profile", function (req, res) {
  let userObj = req.body;

  console.log("Updating profile");
  // MongoClient.connect(mongoUrlLocal).then((client) => {
  MongoClient.connect(mongoUrlDocker).then((client) => {
    const db = client.db(databaseName);
    userObj["userid"] = 1;
    const query = { userid: 1 };
    let newvalues = { $set: userObj };

    db.collection("users")
      .updateOne(query, newvalues, { upsert: true })
      .then(() => {
        res.send(userObj);
      });
  });
});

app.get("/get-profile", function (req, res) {
  // MongoClient.connect(mongoUrlLocal)
  MongoClient.connect(mongoUrlDocker)
    .then((client) => {
      const db = client.db(databaseName);
      const query = { userid: 1 };

      db.collection("users")
        .findOne(query)
        .then((resp) => {
          res.send(resp || {});
        });
    })
    .catch((err) => {
      console.error(err);
    });
});

mongoose.connection.on("connected", () => console.log("connected"));

app.listen(PORT, function () {
  console.log(`app listening on port ${PORT}`);
});
