import multer from "multer";

export const PORT = 3000;
export const MONGO_URL = "mongodb://127.0.0.1:27017/mern";

export const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const filter = (req, file, callback) => {
  if (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png" ||
    file.mimetype == "image/svg" ||
    file.mimetype == "application/pdf"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};
