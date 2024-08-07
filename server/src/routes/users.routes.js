import express from "express"
import { deleteUser, editUser, getAllUsers, registerUser, userHistory } from "../controllers/users.controllers.js";
import { isAdmin, isContentWriter, uploadStorage, validateUser } from "../middleware/middleware.js";
import { wrapAsync } from "../utils/wrapAsync.js";
const router = express.Router()

router.post(
    "/register",
    uploadStorage.fields([
      { name: "profile_picture", maxCount: 1 },
      { name: "resume", maxCount: 1 },
    ]),
    validateUser,
    wrapAsync(registerUser)
)
  
  router.get("/getAllUser", isAdmin, wrapAsync(getAllUsers)
);

  router.patch("/:id/edit", isContentWriter, uploadStorage.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]), wrapAsync(editUser)
);
  
  
  router.get("/:id/history", isAdmin, wrapAsync(userHistory))
  router.delete("/:id", isAdmin, wrapAsync(deleteUser))
    


  export default router;