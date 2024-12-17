// const multer = require("multer");
// const sharp = require("sharp");
// const path = require("path");
// const fs = require("fs");

// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../public/images"));
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.round() * 1e9);
//     const ext = path.extname(file.originalname); // Extract the original extension
//     cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//     // cb(null, file.filename + "-" + uniqueSuffix + ".jpeg"); // previous code
//   },
// });

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(
//       {
//         message: "Unsupported file format",
//       },
//       false
//     );
//   }
// };

// const uploadPhoto = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
//   limits: { fileSize: 2000000 },
// });

// new code 01
// const productImgResize = async (req, res, next) => {
//   try {
//     if (!req.files || !req.files.productImages) return next();

//     const productFiles = req.files.productImages;

//     await Promise.all(
//       productFiles.map(async (file) => {
//         const outputFilePath = `../public/images/products/${file.filename}`;

//         // Process with sharp
//         await sharp(file.path)
//           .resize(300, 300)
//           .toFormat("jpeg")
//           .jpeg({ quality: 90 })
//           .toFile(outputFilePath);

//         // Safely remove original file
//         await safeUnlink(file.path);
//       })
//     );

//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// new code 02

// const safeUnlink = async (filePath) => {
//   try {
//     await fs.unlink(filePath);
//     console.log(`Deleted: ${filePath}`);
//   } catch (err) {
//     console.error(`Error deleting file: ${filePath}`, err);
//   }
// };

// const productImgResize = async (req, res, next) => {
//   try {
//     if (!req.files || !req.files.productImages) {
//       console.log("No files to process");
//       return next();
//     }

//     const productFiles = req.files.productImages;

//     await Promise.all(
//       productFiles.map(async (file) => {
//         const outputFilePath = path.resolve(
//           __dirname,
//           "../public/images/products",
//           file.filename
//         );

//         console.log("Processing file:", file.path);
//         console.log("Saving to:", outputFilePath);

//         try {
//           await sharp(file.path)
//             .resize(300, 300)
//             .toFormat("jpeg")
//             .jpeg({ quality: 90 })
//             .toFile(outputFilePath);
//           console.log(`File processed: ${file.filename}`);
//         } catch (sharpError) {
//           console.error("Sharp processing error:", sharpError);
//         }

//         // Safely remove original file
//         await safeUnlink(file.path);
//       })
//     );

//     next();
//   } catch (error) {
//     console.error("Middleware error:", error);
//     next(error);
//   }
// };

// const blogImgResize = async (req, res, next) => {
//   if (!req.files) return next();
//   await Promise.all(
//     req.files.map(async (file) => {
//       await sharp(file.path)
//         .resize(300, 300)
//         .toFormat("jpeg")
//         .jpeg({ quality: 90 })
//         .toFile(`public/images/blogs/${file.filename}`);
//     })
//   );
//   next();
// };

// module.exports = { uploadPhoto, productImgResize, blogImgResize };

// second code (revised)

// const multer = require("multer");
// const sharp = require("sharp");
// const path = require("path");
// const fs = require("fs/promises"); // Use promises for async file operations

// // Configure Multer storage
// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../public/images")); // Temporary upload folder
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // Generate unique suffix
//     const ext = path.extname(file.originalname); // Extract the original extension
//     cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // Create filename
//   },
// });

// // Filter for image files
// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true); // Accept the file
//   } else {
//     cb(new Error("Unsupported file format"), false); // Reject the file
//   }
// };

// // Multer instance
// const uploadPhoto = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
//   limits: { fileSize: 2000000 }, // Limit to 2MB
// });

// const safeUnlink = async (filePath) => {
//   try {
//     await fs.promises.unlink(filePath);
//   } catch (error) {
//     console.error(`Failed to delete file: ${filePath}`, error.message);
//     // Continue without throwing error to avoid crashing the app
//   }
// };

// previous code
// const productImgResize = async (req, res, next) => {
//   if (!req.files) return next();
//   await Promise.all(
//     req.files.map(async (file) => {
//       await sharp(file.path)
//         .resize(300, 300)
//         .toFormat("jpeg")
//         .jpeg({ quality: 90 })
//         .toFile(`public/images/products/${file.filename}`);
//       fs.unlinkSync(`public/images/products/${file.filename}`);
//     })
//   );
//   next();
// };

// const productImgResize = async (req, res, next) => {
//   try {
//     if (!req.files || !req.files.productImages) return next();

//     const productFiles = req.files.productImages;

//     await Promise.all(
//       productFiles.map(async (file) => {
//         const outputFilePath = `public/images/products/${file.filename}`;

//         // Process with sharp
//         await sharp(file.path)
//           .resize(300, 300)
//           .toFormat("jpeg")
//           .jpeg({ quality: 90 })
//           .toFile(outputFilePath);

//         // Safely remove original file
//         await safeUnlink(file.path);
//       })
//     );

//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// const blogImgResize = async (req, res, next) => {
//   try {
//     if (!req.files || !req.files.blogImages) return next();

//     const blogFiles = req.files.blogImages; // Get the array of blog images

//     await Promise.all(
//       blogFiles.map(async (file) => {
//         const outputFilePath = `public/images/blogs/${file.filename}`;
//         await sharp(file.path)
//           .resize(300, 300)
//           .toFormat("jpeg")
//           .jpeg({ quality: 90 })
//           .toFile(outputFilePath);

//         // Remove original file after resizing
//         await fs.unlink(file.path);
//       })
//     );

//     next();
//   } catch (error) {
//     next(error); // Pass error to centralized error handler
//   }
// };

// // Export modules
// module.exports = {
//   uploadPhoto,
//   productImgResize,
//   blogImgResize,
// };

// fourth code

// const multer = require("multer");
// const sharp = require("sharp");
// const path = require("path");
// const fs = require("fs").promises; // Use promises for async `unlink`

// 1. Multer Configuration
// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Save original images temporarily
//     cb(null, path.join(__dirname, "../public/images")); // Temp folder for uploads
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname); // Preserve original extension
//     cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//   },
// });

// // Multer filter to accept only image files
// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Unsupported file format"), false);
//   }
// };

// // Initialize multer with limits
// const uploadPhoto = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
//   limits: { fileSize: 2000000 }, // 2MB limit
// });

// // 2. Helper Function to Delete Files
// const safeUnlink = async (filePath) => {
//   try {
//     await fs.unlink(filePath);
//     console.log(`Deleted: ${filePath}`);
//   } catch (err) {
//     console.error(`Error deleting file: ${filePath}`, err);
//   }
// };

// // 3. Middleware: Resize Product Images
// const productImgResize = async (req, res, next) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       console.log("No files to process");
//       return next();
//     }

//     const outputDir = path.resolve(__dirname, "../public/images/products");
//     await fs.mkdir(outputDir, { recursive: true }); // Ensure the directory exists

//     // Process each file
//     await Promise.all(
//       req.files.map(async (file) => {
//         const outputFilePath = path.join(outputDir, file.filename);

//         console.log("Processing file:", file.path);
//         console.log("Saving to:", outputFilePath);

//         try {
//           // Resize and save processed image
//           await sharp(file.path)
//             .resize(300, 300)
//             .toFormat("jpeg")
//             .jpeg({ quality: 90 })
//             .toFile(outputFilePath);

//           console.log(`File processed: ${file.filename}`);
//         } catch (sharpError) {
//           console.error("Sharp processing error:", sharpError);
//         }

//         // Remove original temp file
//         await safeUnlink(file.path);
//       })
//     );

//     next();
//   } catch (error) {
//     console.error("Middleware error:", error);
//     next(error);
//   }
// };

// // 4. Middleware: Resize Blog Images
// const blogImgResize = async (req, res, next) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       console.log("No blog images to process");
//       return next();
//     }

//     const outputDir = path.resolve(__dirname, "../public/images/blogs");
//     await fs.mkdir(outputDir, { recursive: true }); // Ensure the directory exists

//     // Process each file
//     await Promise.all(
//       req.files.map(async (file) => {
//         const outputFilePath = path.join(outputDir, file.filename);

//         console.log("Processing blog image:", file.path);
//         console.log("Saving to:", outputFilePath);

//         await sharp(file.path)
//           .resize(300, 300)
//           .toFormat("jpeg")
//           .jpeg({ quality: 90 })
//           .toFile(outputFilePath);

//         // Remove original temp file
//         await safeUnlink(file.path);
//       })
//     );

//     next();
//   } catch (error) {
//     console.error("Error resizing blog images:", error);
//     next(error);
//   }
// };

// module.exports = {
//   uploadPhoto,
//   productImgResize,
//   blogImgResize,
// };

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "images/products/"); // Specify the folder where images will be saved
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`); // Rename the file to avoid conflicts
//   },
// });

// // File filter to accept only images
// const fileFilter = (req, file, cb) => {
//   const allowedFileTypes = /jpeg|jpg|png|gif/;
//   const mimeType = allowedFileTypes.test(file.mimetype);
//   const extName = allowedFileTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );

//   if (mimeType && extName) {
//     return cb(null, true);
//   }
//   cb(new Error("Only image files are allowed!"));
// };

// // Initialize Multer with the storage and file filter
// const uploadPhoto = multer({
//   storage: storage,
//   limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
//   fileFilter: fileFilter,
// });

// const productImgResize = async (req, res, next) => {
//   try {
//     if (!req.files || !req.files.productImages) return next();

//     const productFiles = req.files.productImages;

//     // Process each file
//     await Promise.all(
//       productFiles?.map(async (file) => {
//         try {
//           const outputDir = path.join(__dirname, "../images/products/");
//           const outputFilePath = path.join(outputDir, file.filename);

//           // Ensure the directory exists
//           await fs.mkdir(outputDir, { recursive: true });

//           // Process with sharp
//           await sharp(file.path)
//             .resize(300, 300)
//             .toFormat("jpeg")
//             .jpeg({ quality: 90 })
//             .toFile(outputFilePath);

//           // Safely remove original file
//           await fs.unlink(file.path);
//         } catch (err) {
//           console.error(`Error processing file ${file.filename}:`, err);
//         }
//       })
//     );

//     next();
//   } catch (error) {
//     console.error("Error in productImgResize middleware:", error);
//     next(error);
//   }
// };

// const uploadImages = uploadPhoto.fields([
//   { name: "productImages", maxCount: 10 }, // Accept up to 10 files under "productImages"
// ]);

// module.exports = {
//   uploadPhoto,
//   productImgResize,
//   uploadImages,
// };

// chatgpt code

// const multer = require("multer");
// const path = require("path");
// const fs = require("fs/promises");

// const storage = multer.diskStorage({
//   destination: "images/temp", // Save temporarily for processing
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|gif/;
//   if (allowedTypes.test(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files are allowed!"));
//   }
// };

// const uploadPhoto = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 1024 * 1024 * 5 },
// });

// module.exports = { uploadPhoto };

// chatgpt code 2

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the `temp` directory exists
const tempDir = path.join(__dirname, "../images/temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir); // Save files to the temp directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadPhoto = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit to 5MB
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif/;
    const isValid = allowedFileTypes.test(file.mimetype);
    if (isValid) cb(null, true);
    else cb(new Error("Only image files are allowed!"));
  },
});

module.exports = { uploadPhoto };
