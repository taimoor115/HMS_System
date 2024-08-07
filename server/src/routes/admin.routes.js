import express from "express";
import { wrapAsync } from "../utils/wrapAsync.js";
import { deleteAdmin, loginAdmin, registerAdmin } from "../controllers/admin.contollers.js";
import { isAdmin, validateAdmin, validateLogin } from "../middleware/middleware.js";

const router = express.Router()
router.post("/register",isAdmin, validateAdmin, wrapAsync(registerAdmin));
  
  router.post("/login", validateLogin,wrapAsync(loginAdmin) );
  router.delete("/:id", isAdmin, wrapAsync(deleteAdmin))
  


export default router;