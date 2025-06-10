import { v2 as cloudinary } from "cloudinary";
import { unlink } from "node:fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadFile = async (
  filePath: string,
  format: string,
  isBgRemove?: boolean
) => {
  try {
    if (!filePath) return false;
    if (isBgRemove === true) {
      const response = await cloudinary.uploader.upload(filePath, {
        folder: "ecommerce/products",
        transformation: [
          {
            effect: "background_removal",
            width: 640,
            height: 640,
          },
          {
            fetch_format: "auto",
            quality: "auto:best",
          },
        ],
      });

      return response;
    } else {
      const response = await cloudinary.uploader.upload(filePath, {
        resource_type: format as "image" | "video" | "raw" | "auto",
      });

      // console.log(`file is uploaded successfully ${response.url}`);

      return response;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
       await unlink(filePath);
     
    }
    console.log(error)
    
  }
};

export { uploadFile };
