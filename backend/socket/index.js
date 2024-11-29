import errors from "../errors/index.js";
import User from "../models/userModel.js";
import ChatEvents from "./constraints.js";
import jwt from "jsonwebtoken";

const initializeSocketIO = (io) => {
  return io.on("connection", async (socket) => {
    try {
      const token = socket.handshake.auth?.token;
      const { userId } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(userId).select("-password");
      if (!user) {
        throw new errors.UnauthenticatedError("Authentication invalid");
      }
      // console.log(socket.id);

      socket.user = user;
      socket.join(user._id.toString());
      socket.emit(ChatEvents.CONNECTED_EVENT);
      socket.on(ChatEvents.DISCONNECT_EVENT, () => {
        if (socket.user?._id) {
          socket.leave(socket.user._id);
        }
      });

      socket.on(ChatEvents.JOIN_CHAT_EVENT, (chatId) => {
        socket.join(chatId);
      });

      socket.on(ChatEvents.TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(ChatEvents.TYPING_EVENT, chatId);
      });

      socket.on(ChatEvents.STOP_TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(ChatEvents.STOP_TYPING_EVENT, chatId);
      });
    } catch (error) {
      console.log(error);
      throw new errors.UnauthenticatedError("Authentication invalid");
    }
  });
};

const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get("io").in(roomId).emit(event, payload);
};
export { initializeSocketIO, emitSocketEvent };
