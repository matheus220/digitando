var express = require("express");
var aws = require("aws-sdk");
var multer = require("multer");
var multerS3 = require("multer-s3");
const path = require("path");
var router = express.Router();

// AWS S3 credentials
var s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  Bucket: process.env.S3_BUCKET,
});

function checkFileType(file, cb) {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  // Check mime
  const mimetype = allowedFileTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// Handle image upload to AWS S3
const imageUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  }),
  limits: { fileSize: 5000000 }, // In bytes: 5000000 bytes = 5 MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

// Define route to upload an image
router.post("/image", (req, res) => {
  imageUpload(req, res, (error) => {
    if (error) {
      console.log("errors", error);
      res.json({ error: error });
    } else if (req.file === undefined) {
      // If File not found
      console.log("Error: No File Selected!");
      res.json("Error: No File Selected");
    } else {
      // If Success
      const imageName = req.file.key;
      const imageLocation = req.file.location;
      // Send a reply with the name of the image and its path
      res.json({
        image: imageName,
        location: imageLocation,
      });
    }
  });
});

module.exports = router;
