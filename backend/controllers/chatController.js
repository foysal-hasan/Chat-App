import { StatusCodes } from "http-status-codes";
import asyncHandler from "../middlewares/asyncHandler.js";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import errors from "../errors/index.js";
import { emitSocketEvent } from "../socket/index.js";
import ChatEvents from "../socket/constraints.js";

// GET => /chats
export const getAllChats = asyncHandler(async (req, res, next) => {
  const chats = await Chat.find({
    participants: { $in: [req.user?._id] },
  })
    .populate({
      path: "participants",
      select: "username email",
    })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username email",
      },
    })
    .sort({
      updatedAt: -1,
    });

  res
    .status(StatusCodes.OK)
    .json({ chats, msg: "User chats fetched successfully!" });
});

// POST => /chats/c/:receiverId
export const createOrGetAOneOnOneChat = asyncHandler(async (req, res, next) => {
  const { receiverId } = req.params;
  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new errors.NotFoundError("Receiver not found");
  }

  if (receiver._id.toString() === req.user.toString()) {
    throw new errors.BadRequestError("You cannot chat with yourself");
  }

  const chat = await Chat.findOne({
    isGroupChat: false,
    participants: {
      $all: [req.user._id, receiverId],
    },
  })
    .populate({
      path: "participants",
      select: "username email",
    })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username email",
      },
    });

  if (chat) {
    return res.status(StatusCodes.OK).json({
      chat,
      msg: "Chat retrieved successfully",
    });
  }

  // if chat not found let's create a new one to one chat
  const newChat = await Chat.create({
    name: "One To One Chat",
    participants: [req.user._id, receiverId],
    admin: req.user._id,
  });

  const createdChat = await Chat.findById(newChat._id)
    .populate({
      path: "participants",
      select: "username email",
    })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username email",
      },
    });

  // logic to emit socket event about the new chat added to the participants
  newChat?.participants?.forEach((participant) => {
    // if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is initiating the chat

    // emit event to other participants with new chat
    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEvents.NEW_CHAT_EVENT,
      createdChat
    );
  });

  res.status(StatusCodes.CREATED).json({
    chat: createdChat,
    msg: "Chat retrieved successfully",
  });
});

// POST => /chats/group
export const createAGroupChat = asyncHandler(async (req, res, next) => {
  const { name, participants } = req.body;
  const member = [...new Set([...participants, req.user._id.toString()])];
  if (member.length < 3) {
    throw new errors.BadRequestError("You need 3 unique user include you");
  }
  const chat = await Chat.create({
    name,
    participants: member,
    isGroupChat: true,
    admin: req.user._id,
  });

  const groupChat = await Chat.findById(chat._id)
    .populate({
      path: "participants",
      select: "username email",
    })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username email",
      },
    });

  chat.participants.forEach((participant) => {
    // if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is initiating the chat
    // emit event to other participants with new chat
    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEvents.NEW_CHAT_EVENT,
      groupChat
    );
  });

  res.status(StatusCodes.OK).json({
    groupChat,
    msg: "Group chat created successfully",
  });
});

// GET => /chats/group/:chatId
export const getGroupChatDetails = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  const groupChat = await Chat.findById(chatId)
    .populate({
      path: "participants",
      select: "username email",
    })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username email",
      },
    });
  if (!groupChat) {
    throw new errors.NotFoundError("Group chat does not exist");
  }

  res.status(StatusCodes.OK).json({
    groupChat,
    msg: "Group chat fetched successfully",
  });
});

// PATCH => /chats/group/:chatId
export const renameGroupChat = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  const { name } = req.body;

  const chat = await Chat.findOne({
    _id: chatId,
    admin: req.user._id,
    isGroupChat: true,
  });

  if (!chat) {
    throw new errors.NotFoundError("Group chat does not exist");
  }
  chat.name = name;
  await chat.save();

  const groupChat = await Chat.findById(chat._id)
    .populate({
      path: "participants",
      select: "username email",
    })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username email",
      },
    });

  // logic to emit socket event about the updated chat name to the participants
  chat?.participants?.forEach((participant) => {
    // emit event to all the participants with updated chat
    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEvents.UPDATE_GROUP_NAME_EVENT,
      groupChat
    );
  });

  res.status(StatusCodes.OK).json({
    groupChat,
    msg: "Group chat name updated successfully",
  });
});

// DELETE => /chats/group/:chatId
export const deleteGroupChat = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  const chat = await Chat.findOne({
    _id: chatId,
    admin: req.user._id,
    isGroupChat: true,
  });

  if (!chat) {
    throw new errors.NotFoundError("Group chat does not exist");
  }

  // delete all the messages belongs to this chat

  const participants = chat.participants;
  await Chat.findByIdAndDelete(chatId);

  participants?.forEach((participant) => {
    // if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is deleting
    // emit event to other participants with left chat
    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEvents.LEAVE_CHAT_EVENT,
      chat
    );
  });

  res.status(StatusCodes.OK).json({ msg: "Group chat deleted successfully" });
});

// DELETE => /chats/remove/:chatId
export const deleteOneOnOneChat = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  console.log(chatId);

  const chat = await Chat.findOne({
    _id: chatId,
    participants: { $in: [req.user?._id] },
  });

  if (!chat) {
    throw new errors.NotFoundError("Chat does not exist");
  }

  // delete all the messages belongs to this chat

  const participants = chat.participants;
  await Chat.findByIdAndDelete(chatId);

  participants?.forEach((participant) => {
    // if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is deleting
    // emit event to other participants with left chat
    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEvents.LEAVE_CHAT_EVENT,
      chat
    );
  });

  res.status(StatusCodes.OK).json({ msg: "Chat deleted successfully" });
});

// POST => chats/group/:chatId/:participantId
export const addParticipantToGroupChat = asyncHandler(
  async (req, res, next) => {
    const { chatId, participantId } = req.params;
    const groupChat = await Chat.findById(chatId);

    if (!groupChat || !groupChat.isGroupChat) {
      throw new errors.NotFoundError("Group chat does not exist");
    }

    // check if user who is adding is a group admin
    if (groupChat.admin?.toString() !== req.user._id?.toString()) {
      throw new errors.BadRequestError("You are not an admin");
    }

    const existingParticipants = groupChat.participants;

    // check if the participant that is being added in a part of the group
    if (existingParticipants?.includes(participantId)) {
      throw new errors.BadRequestError("Participant already in a group chat");
    }

    await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: {
          participants: participantId, // add new participant id
        },
      },
      { new: true }
    );

    const chat = await Chat.findById(chatId)
      .populate({
        path: "participants",
        select: "username email",
      })
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username email",
        },
      });

    // emit new chat event to the added participant
    emitSocketEvent(req, participantId, ChatEvents.NEW_CHAT_EVENT, chat);
    groupChat?.participants?.forEach((participant) => {
      // emit event to all the participants with updated chat
      emitSocketEvent(
        req,
        participant._id?.toString(),
        ChatEvents.ADD_PARTICIPANT_TO_GROUP,
        chat
      );
    });

    res.status(StatusCodes.OK).json({
      chat,
      msg: "Participant added successfully",
    });
  }
);

// DELETE => chats/group/:chatId/:participantId
export const deleteParticipantFromGroupChat = asyncHandler(
  async (req, res, next) => {
    const { chatId, participantId } = req.params;
    const groupChat = await Chat.findById(chatId);

    if (!groupChat || !groupChat.isGroupChat) {
      throw new errors.NotFoundError("Group chat does not exist");
    }

    // check if user who is adding is a group admin
    if (groupChat.admin?.toString() !== req.user._id?.toString()) {
      throw new errors.BadRequestError("You are not an admin");
    }

    const existingParticipants = groupChat.participants;

    if (!existingParticipants?.includes(participantId)) {
      throw new errors.BadRequestError(
        "Participant does not exist in the group chat"
      );
    }

    await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: {
          participants: participantId, // remove participant id
        },
      },
      { new: true }
    );

    const chat = await Chat.findById(chatId)
      .populate({
        path: "participants",
        select: "username email",
      })
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username email",
        },
      });

    // emit new chat event to the added participant
    emitSocketEvent(req, participantId, ChatEvents.LEAVE_CHAT_EVENT, chat);
    groupChat?.participants?.forEach((participant) => {
      // emit event to all the participants with updated chat
      emitSocketEvent(
        req,
        participant._id?.toString(),
        ChatEvents.REMOVE_PARTICIPANT_FROM_GROUP,
        chat
      );
    });

    res.status(StatusCodes.OK).json({
      chat,
      msg: "Participant removed successfully",
    });
  }
);

// DELETE => /chats/leave/group/:chatId
export const leaveGroupChat = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  // check if chat is a group
  const groupChat = await Chat.findOne({
    _id: chatId,
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new errors.NotFoundError("Group chat does not exist");
  }

  const existingParticipants = groupChat.participants;

  // check if the participant that is leaving the group, is part of the group
  if (!existingParticipants?.includes(req.user?._id)) {
    throw errors.BadRequestError("You are not a part of this group chat");
  }

  await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: req.user?._id, // leave the group
      },
    },
    { new: true }
  );

  const chat = await Chat.findById(chatId)
    .populate({
      path: "participants",
      select: "username email",
    })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username email",
      },
    });

  emitSocketEvent(req, participantId, ChatEvents.LEAVE_CHAT_EVENT, chat);
  groupChat?.participants?.forEach((participant) => {
    // emit event to all the participants with updated chat
    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEvents.LEAVE_CHAT_EVENT,
      chat
    );
  });
  res.status(StatusCodes.OK).json({
    chat,
    msg: "Left a group successfully",
  });
});
