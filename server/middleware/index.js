import jwt from "jsonwebtoken";
import { filter, userStorage } from "../config.js";
import multer from "multer";

export const uploadStorage = multer({
  storage: userStorage,
  fileFilter: filter,
});

// export const protectedRoutes = (req, res) => {
//   jwt.verify(
//     req.token,
//     process.env.JSON_WEB_TOKEN_SECRET_KEY,
//     (err, authorizedData) => {
//       if (err) {
//         console.log("Error: Could not connect to the protected route");
//         res.sendStatus(403);
//       } else {
//         res.json({ message: "Successfull", authorizedData });
//         console.log("SUCCESS: Connected to protected route");
//       }
//     }
//   );
// };

export const checkToken = (req, res, next) => {
  const header = req.headers["authorization"];
  if (typeof header !== undefined) {
    const bearer = header.split(" ");
    console.log("Bearer"), bearer;
    const token = bearer[1];
    req.token = token;
    next();
  } else {
    res.sendStatus(403);
  }
};
