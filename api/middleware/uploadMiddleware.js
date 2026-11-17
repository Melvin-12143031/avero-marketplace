import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB

  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      const error = new Error(
        "Invalid file type. Only JPEG, PNG, and WEBP files are allowed",
      );

      error.statusCode = 400;

      callback(error);
    }
  },
});
export default upload;
