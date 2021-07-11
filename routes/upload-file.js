var express = require("express");
fs = require('fs');
var router = express.Router();

/* Listening for new file post */
router.post("/", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      console.log("req.files", req.files);
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let file = req.files.file;

      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      file.mv("./uploads/last-file.txt");
      file.mv("./public/file/new-file.txt");
      fs.writeFile("./public/file/new-file.txt", 'Hello World!', function (err) {
        if (err) return console.log(err);
        console.log('Hello World > helloworld.txt');
      });

      //TODO: Create new file here:

      //send response
      res.send({
        status: true,
        message: "File is uploaded",
        data: {
          name: file.name,
          mimetype: file.mimetype,
          size: file.size,
          newFileUrl: "./file/new-file.txt",
        },
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
