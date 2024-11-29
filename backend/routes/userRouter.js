import express from "express";
import {
  getUsers,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.route("/").get(protect, getUsers).post(registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
