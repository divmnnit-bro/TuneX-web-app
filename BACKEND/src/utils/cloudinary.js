import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) throw new Error("File Path is required");

      const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
        localFilePath,
        { resource_type: "auto", chunk_size: 6000000 },
        (error, result) => {
            if (error) reject(error);
            else resolve(result);
        }
    );
});

       try {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
} catch (unlinkErr) {
    console.log("Cleanup warning (non-fatal):", unlinkErr.message);
}

return result;
    } catch (err) {
        console.log("CLOUDINARY UPLOAD ERROR:", err);
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadOnCloudinary };