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
      let file = req.files.file;

      // The mv() method moves the file in the given path
      file.mv("./uploads/last-file.txt");
      fs.readFile("./uploads/last-file.txt", "utf8", function (err, data) {
        var result = transformer.transformData(data);

        fs.writeFile("./public/new-map.txt", result.newData, function (err) {
          if (err) return console.log(err);
        });

        // Send response
        res.send({
          status: result.valid,
          message: result.valid ? "File is uploaded" : "Incorrect file format",
          newFileUrl: result.valid ? "./new-map.txt" : "",
          map: result.map,
          newMap: result.transformedMap,
        });
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
