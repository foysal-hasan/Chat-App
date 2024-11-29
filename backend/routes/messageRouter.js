import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getAllMessages,
  sendMessage,
  deleteMessage,
} from "../controllers/messageController.js";
import { upload } from "../middlewares/multerMiddleware.js";
const router = express.Router();

router.use(protect);

router
  .route("/:chatId")
  .get(getAllMessages)
  .post(upload.array("attachments", 5), sendMessage);
router.route("/:chatId/:messageId").delete(deleteMessage);

export default router;
