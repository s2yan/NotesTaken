import { v2 as cloudinary } from "cloudinary";
import { apiErrorResponse } from "./apiErrorResponse.js";
import dotenv from "dotenv";

dotenv.config({ path: "./src/.env" });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary
const uploadToCloudinary = async (localFilePath) => {
    
    try {
        const cloudinaryInstance = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        return cloudinaryInstance;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw new apiErrorResponse(500, "Something went wrong while uploading the image to Cloudinary");
    }
};

export { uploadToCloudinary };
