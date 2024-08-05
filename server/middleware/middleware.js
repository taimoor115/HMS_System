import jwt from "jsonwebtoken";
import { filter, userStorage } from "../config.js";
import multer from "multer";
import "dotenv/config";
import {
  adminValidator,
  loginValidator,
  userValidator,
} from "../schema/validation.js";
import ExpressError from "../lib/utils/ExpressError.js";
import Admin from "../model/adminModel.js";

export const uploadStorage = multer({
  storage: userStorage,
  fileFilter: filter,
});

export function validateUser(req, res, next) {
  const { error } = userValidator.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((err) => err.message).join(",");
    return next(new ExpressError(400, errorMessage));
  }
  if (!req.files.profile_picture || !req.files.resume) {
    return next(
      new ExpressError(400, "Profile picture and resume is required")
    );
  }
  next();
}
export function validateAdmin(req, res, next) {
  const { error } = adminValidator.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((err) => err.message).join(",");
    return next(new ExpressError(400, errorMessage));
  }
  next();
}
export function validateLogin(req, res, next) {
  const { error } = loginValidator.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((err) => err.message).join(",");
    return next(new ExpressError(400, errorMessage));
  }
  next();
}

export const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[0];
    if (!token) {
      return res.status(400).json({ error: "No token provided..." });
    }

    const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET_KEY);

    if (!decoded) {
      return res.status(400).json({ error: "Token is invalid" });
    }

    const admin = await Admin.findById(decoded._id);

    if (admin.access_token !== token) {
      return res.status(400).json({ error: "Token expires" });
    }
    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({ error: "Access Denied" });
    }

    req.user = admin;
    next();
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
