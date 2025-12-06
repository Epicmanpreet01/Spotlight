import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/JPEG",
    "image/PNG",
    "video/mp4",
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(
      new Error("Only images (jpg, jpeg, png) and mp4 videos allowed"),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
});

export default upload;
