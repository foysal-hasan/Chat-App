import asyncHandler from "../middlewares/asyncHandler.js";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import errors from "../errors/index.js";
import { StatusCodes } from "http-status-codes";
import { emitSocketEvent } from "../socket/index.js";
import ChatEvents from "../socket/constraints.js";

// GET => /messsages/:chatId
export const getAllMessages = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  const selectedChat = await Chat.findOne({
    _id: chatId,
    participants: { $in: [req.user?._id] },
  });

  if (!selectedChat) throw new errors.NotFoundError("Chat does not exist");

  const messages = await Message.find({ chat: chatId })
    .populate({
      path: "sender",
      select: "username email",
    })
    .sort({
      createdAt: 1,
    });

  res
    .status(StatusCodes.OK)
    .json({ messages, msg: "Messages fetched successfully" });
});

// POSt => /messsages/:chatId
export const sendMessage = asyncHandler(async (req, res, next) => {
  console.log(req.body);

  const { chatId } = req.params;
  const { content } = req.body;
  console.log(req.files);

  if (!content && !req.files?.length) {
    throw new errors.BadRequestError(
      "Message content or attachment is required"
    );
  }

  const selectedChat = await Chat.findOne({
    _id: chatId,
    participants: { $in: [req.user?._id] },
  });

  if (!selectedChat) throw new errors.NotFoundError("Chat does not exist");

  const messageFiles = [];
  /// handleMessage uploads and generate path and push them into the messageFiles array
  if (req.files && req.files.length > 0) {
    req.files?.map((attachment) => {
      messageFiles.push(`/uploads/${attachment.filename}`);
    });
  }

  const message = await Message.create({
    sender: req.user._id,
    content: content || "",
    attachments: messageFiles,
    chat: chatId,
  });

  // update the chat lastMessage
  selectedChat.lastMessage = message._id;
  await selectedChat.save();

  const receivedMessage = await Message.findById(message._id).populate({
    path: "sender",
    select: "username email",
  });

  // logic to emit socket event about the new message created to the other participants
  selectedChat.participants.forEach((participantObjectId) => {
    // here the chat is the raw instance of the chat in which participants is the array of object ids of users
    // avoid emitting event to the user who is sending the message
    if (participantObjectId.toString() === req.user._id.toString()) return;

    // emit the receive message event to the other participants with received message as the payload
    emitSocketEvent(
      req,
      participantObjectId.toString(),
      ChatEvents.MESSAGE_RECEIVED_EVENT,
      receivedMessage
    );
  });

  console.log(receivedMessage);

  res
    .status(StatusCodes.CREATED)
    .json({ receivedMessage, msg: "Message saved successfully" });
});

// DELETE => /messsages/:chatId/:messageId
export const deleteMessage = asyncHandler(async (req, res, next) => {
  const { chatId, messageId } = req.params;

  const selectedChat = await Chat.findOne({
    _id: chatId,
    participants: { $in: [req.user?._id] },
  });

  if (!selectedChat) throw new errors.NotFoundError("Chat does not exist");

  const message = await Message.findOne({
    _id: messageId,
    sender: req.user._id,
  });

  if (!message) throw new errors.NotFoundError("Message does not exist");

  if (message.attachments.length > 0) {
    // delete them from memory
  }

  // delete the message
  await Message.findByIdAndDelete(messageId);

  if (selectedChat.lastMessage._id.toString() === messageId.toString()) {
    const lastMessage = await Message.findOne({ chat: chatId }).sort({
      createdAt: -1,
    });

    // await Chat.findByIdAndUpdate(chatId, {
    //   lastMessage: lastMessage ? lastMessage._id : null,
    // });
    selectedChat.lastMessage = lastMessage ? lastMessage._id : null;
    await selectedChat.save();
  }

  // logic to emit socket event about the message deleted  to the other participants
  selectedChat.participants.forEach((participantObjectId) => {
    // here the chat is the raw instance of the chat in which participants is the array of object ids of users
    // avoid emitting event to the user who is deleting the message
    if (participantObjectId.toString() === req.user._id.toString()) return;
    // emit the delete message event to the other participants frontend with delete messageId as the payload
    emitSocketEvent(
      req,
      participantObjectId.toString(),
      ChatEvents.MESSAGE_DELETE_EVENT,
      message
    );
  });

  return res
    .status(StatusCodes.OK)
    .json({ message, msg: "Message deleted successfully" });
});
