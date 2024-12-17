// const asyncHandler = require("express-async-handler");
// const {
//   cloudinaryUploadImg,
//   cloudinaryDeleteImg,
// } = require("../utils/cloudinary");
// const fs = require("fs");

// const uploadImages = asyncHandler(async (req, res) => {
//   try {
//     const uploader = async (path) => cloudinaryUploadImg(path, "images");
//     const urls = [];
//     const files = req.files;
//     for (const file of files) {
//       const { path } = file;
//       const newpath = await uploader(path);
//       urls.push(newpath);
//       fs.unlinkSync(path);
//     }
//     const images = urls.map((file) => {
//       return file;
//     });
//     res.json(images);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const deleteImages = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deleted = cloudinaryDeleteImg(id, "images");
//     res.json({ message: "Images deleted successfully" });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// module.exports = {
//   uploadImages,
//   deleteImages,
// };

// chatgpt code

// const asyncHandler = require("express-async-handler");
// const {
//   cloudinaryUploadImg,
//   cloudinaryDeleteImg,
// } = require("../utils/cloudinary");
// const fs = require("fs/promises");

// const uploadImages = asyncHandler(async (req, res) => {
//   try {
//     const urls = [];
//     const files = req.files;

//     for (const file of files) {
//       const { path } = file;
//       const uploadResult = await cloudinaryUploadImg(path);
//       urls.push(uploadResult);
//       await fs.unlink(path); // Delete local file after upload
//     }

//     res.json(urls); // Return uploaded URLs
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// const deleteImages = asyncHandler(async (req, res) => {
//   try {
//     const { id } = req.params; // `id` should be the public_id
//     await cloudinaryDeleteImg(id);
//     res.json({ message: "Image deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = {
//   uploadImages,
//   deleteImages,
// };

// chatgpt code 2

const asyncHandler = require("express-async-handler");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const fs = require("fs/promises");

const uploadImages = asyncHandler(async (req, res) => {
  try {
    const urls = [];
    const files = req.files;

    for (const file of files) {
      const { path } = file;
      console.log("File stored at:", path); // Debug log
      const uploadResult = await cloudinaryUploadImg(path);

      urls.push(uploadResult);

      // Uncomment below line to delete temp file after upload
      // await fs.unlink(path);
    }

    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const deleteImages = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params; // `id` should be the public_id
    await cloudinaryDeleteImg(id);
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  uploadImages,
  deleteImages,
};
