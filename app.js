var express = require("express");
var fileUpload = require("express-fileupload");
var cors = require("cors");
var morgan = require("morgan");
var _ = require("lodash");

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var newFileRouter = require("./routes/upload-file");

var app = express();

app.use(logger("dev"));
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 2 * 1024 * 1024 * 1024, // 2MB max file(s) size
    },
  })
);
app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/upload-file", newFileRouter);

module.exports = app;
