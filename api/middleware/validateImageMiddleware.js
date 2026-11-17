import { fileTypeFromBuffer } from "file-type";

const validateImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const detectedType = await fileTypeFromBuffer(req.file.buffer);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (
      !detectedType ||
      !allowedTypes.includes(detectedType.mime) ||
      detectedType.mime !== req.file.mimetype
    ) {
      const error = new Error(
        "Invalid image content. Only genuine JPEG, PNG, and WEBP images are allowed.",
      );

      error.statusCode = 400;
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default validateImage;
