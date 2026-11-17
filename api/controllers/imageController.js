import cloudinary from "../config/cloudinary.js";

const uploadImageController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please select an image to upload.",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "ecommerce-marketplace/products",
          resource_type: "image",
        },
        (error, uploadImage) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploadImage);
          }
        },
      );
      uploadStream.end(req.imageBuffer);
    });

    return res.status(200).json({
      status: "success",
      message: "Image uploaded successfully.",
      data: {
        image: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to upload image.",
    });
  }
};

export { uploadImageController };
