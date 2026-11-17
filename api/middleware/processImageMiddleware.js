import sharp from "sharp";

const processImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const processedBuffer = await sharp(req.file.buffer, {
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .resize({
        width: 2000,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    req.imageBuffer = processedBuffer;

    next();
  } catch {
    const imageError = new Error(
      "Unable to process image. Please upload a valid image file.",
    );

    imageError.statusCode = 400;
    next(imageError);
  }
};

export default processImage;
