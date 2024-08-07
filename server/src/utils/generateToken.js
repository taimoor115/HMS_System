import jwt from "jsonwebtoken";

export const generateToken = (user, res) => {
  const token = jwt.sign(
    { _id: user._id, name: user.name, role: user.role },
    process.env.JSON_WEB_TOKEN_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );

  console.log("Token", token);

  return token;
};
