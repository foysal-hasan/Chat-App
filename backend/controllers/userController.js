import errors from "../errors/index.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import generateTokenAndSendResponse from "../utils/generateTokenAndSendResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new errors.BadRequestError("Provide username, email and password");
  }

  if (await User.findOne({ username })) {
    throw new errors.BadRequestError("username already taken");
  }
  const user = await User.create({ username, email, password });
  generateTokenAndSendResponse(res, user);
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new errors.BadRequestError("Provide username and password");
  }
  const user = await User.findOne({ username });

  if (!user || !(await user.matchPassword(password))) {
    throw new errors.BadRequestError("Invalid username or password");
  }

  generateTokenAndSendResponse(res, user);
});

export const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    expiresIn: new Date(0),
    httpOnly: true,
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const getUsers = asyncHandler(async (req, res) => {
  let search = {};
  if (req.query?.search) {
    search = { $regex: req.query?.search, $options: "i" };
  }
  const users = await User.find({
    _id: {
      $ne: req.user._id,
    },
    username: search,
  })
    .select("username _id")
    .limit(4);
  res.status(200).json(users);
});
