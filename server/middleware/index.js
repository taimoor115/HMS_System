import { filter, userStorage } from "../config.js";
import multer from "multer";

export const uploadStorage = multer({
  storage: userStorage,
  fileFilter: filter,
});
