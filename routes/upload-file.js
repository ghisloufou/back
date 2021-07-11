var express = require("express");
fs = require("fs");
var router = express.Router();
var Transformer = require("../Transformer");
var transformer = new Transformer();

/* Listening for new file post */
router.post("/", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let file = req.files.file;

      //Use the mv() method moves the file in the given path
      file.mv("./uploads/last-file.txt");
      fs.readFile("./uploads/last-file.txt", "utf8", function (err, data) {
        var result = transformer.transformData(data);
        console.log("newData", result.transformedData);

        fs.writeFile(
          "./public/new-file.txt",
          "result.transformedData",
          function (err) {
            if (err) return console.log(err);
          }
        );

        //send response
        res.send({
          status: result.valid,
          message: result.valid ? "File is uploaded" : "Incorrect file format",
          newFileUrl: result.valid ? "./new-file.txt" : "",
          map: result.transformedData,
          newMap: {},
        });
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
