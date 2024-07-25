import jwt from "jsonwebtoken";

export const generateToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JSON_WEB_TOKEN_SECRET_KEY, {
    expiresIn: "7d",
  });

  console.log("Token", token);

  //   res.cookie("token", token, {
  //     maxAge: 7 * 24 * 60 * 60 * 1000,
  //     httpOnly: true,
  //     sameSite: "strict",
  //     secure: "false",
  //     secure: process.env.NODE_ENV !== "development",
  //   });
  return token;
};
