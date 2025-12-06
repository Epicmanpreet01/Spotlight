import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";

export const getPublicIdFromUrl = (url = "") => {
  try {
    const withoutQuery = url.split("?")[0];
    const parts = withoutQuery.split("/");

    // Remove up to the "upload" segment
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) return null;

    const pathParts = parts.slice(uploadIndex + 1);

    // Remove extension from last segment
    const last = pathParts.pop();
    const id = last.split(".")[0];

    return [...pathParts, id].join("/");
  } catch (err) {
    console.error("Error extracting publicId:", err);
    return null;
  }
};

export const uploadToCloudinary = async (
  file,
  folder = "performers_gallery"
) => {
  try {
    let result;

    if (file.path) {
      // diskStorage → file.path exists
      result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: "auto",
      });

      // cleanup local file
      await fs.unlink(file.path).catch(() => {});
    } else if (file.buffer) {
      // memoryStorage → must use upload_stream
      result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "auto",
          },
          (err, uploaded) => {
            if (err) reject(err);
            else resolve(uploaded);
          }
        );

        stream.end(file.buffer);
      });
    } else {
      throw new Error("Invalid file format: requires .path or .buffer");
    }

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);

    // Cleanup on failure
    if (file.path) {
      await fs.unlink(file.path).catch(() => {});
    }

    throw new Error("Cloudinary upload failed");
  }
};
