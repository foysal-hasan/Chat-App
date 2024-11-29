import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";
import errors from "../errors/index.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token =
    req.cookies?.jwt ||
    req.body.token ||
    req.headers?.authorization?.split(" ")[1];

  if (!token) {
    throw new errors.UnauthenticatedError("Authentication invalid");
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new errors.UnauthenticatedError("Authentication invalid");
    }
    req.user = user;
    next();
  } catch (err) {
    throw new errors.UnauthenticatedError("Authentication invalid");
  }
});
