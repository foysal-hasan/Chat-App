import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getAllChats,
  createOrGetAOneOnOneChat,
  createAGroupChat,
  getGroupChatDetails,
  renameGroupChat,
  deleteGroupChat,
  addParticipantToGroupChat,
  deleteParticipantFromGroupChat,
  deleteOneOnOneChat,
  leaveGroupChat,
} from "../controllers/chatController.js";
const router = express.Router();

router.use(protect);

router.route("/").get(getAllChats);
router.route("/c/:receiverId").post(createOrGetAOneOnOneChat);
router.route("/group").post(createAGroupChat);
router
  .route("/group/:chatId")
  .get(getGroupChatDetails)
  .patch(renameGroupChat)
  .delete(deleteGroupChat);

router
  .route("/group/:chatId/:participantId")
  .post(addParticipantToGroupChat)
  .delete(deleteParticipantFromGroupChat);

router.route("/leave/group/:chatId").delete(leaveGroupChat);
router.route("/remove/:chatId").delete(deleteOneOnOneChat);

export default router;
