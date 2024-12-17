const express = require("express");
const {
  uploadImages,
  deleteImages,
} = require("../controller/uploadController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages");

const router = express.Router();

// router.post(
//   "/",
//   authMiddleware,
//   isAdmin,
//   uploadPhoto.fields("images", 10),
//   productImgResize,
//   uploadImages
// );

// router.post(
//   "/",
//   authMiddleware,
//   isAdmin,
//   handleUploads,
//   productImgResize,
//   (req, res) => {
//     res.send("Images processed successfully!");
//   }
// );

// router.post(
//   "/",
//   authMiddleware,
//   isAdmin,
//   handleUploads,
//   productImgResize,
//   (req, res) => {
//     res.status(200).json({
//       message: "Product images uploaded and resized successfully!",
//       files: req.files,
//     });
//   }
// );

// router.post(
//   "/",
//   authMiddleware,
//   isAdmin,
//   uploadPhoto.array("productImages", 10),
//   productImgResize,
//   uploadImages
// );

// router.delete("/deleteImage/:id", authMiddleware, isAdmin, deleteImages);

// module.exports = router;

// chatgpt code

// const express = require("express");
// const {
//   uploadImages,
//   deleteImages,
// } = require("../controllers/uploadController");
// const { uploadPhoto } = require("../middlewares/uploadImages");
// const router = express.Router();

router.post("/", uploadPhoto.array("productImages", 10), uploadImages);
router.delete("/:id", deleteImages);

module.exports = router;
