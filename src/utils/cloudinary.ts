import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadFile = async (filePath: string, format: string) => {
  try {
    if (!filePath) return false;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: format as "image" | "video" | "raw" | "auto",
    });
    
    console.log(`file is uploaded successfully ${response.url}`);

    return response;
  } catch (error: unknown) {
    console.log(error);
    return null;
  }
};

export { uploadFile };
