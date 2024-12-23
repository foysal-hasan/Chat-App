const ChatEvents = {
  CONNECTED_EVENT: "connected",
  DISCONNECT_EVENT: "disconnect",
  JOIN_CHAT_EVENT: "joinChat",
  LEAVE_CHAT_EVENT: "leaveChat",
  UPDATE_GROUP_NAME_EVENT: "updateGroupName",
  MESSAGE_RECEIVED_EVENT: "messageReceived",
  NEW_CHAT_EVENT: "newChat",
  SOCKET_ERROR_EVENT: "socketError",
  STOP_TYPING_EVENT: "stopTyping",
  TYPING_EVENT: "typing",
  MESSAGE_DELETE_EVENT: "messageDeleted",
  ADD_PARTICIPANT_TO_GROUP: "addParticipantToGroup",
  REMOVE_PARTICIPANT_FROM_GROUP: "removeParticipantFromGroup",
  USER_LEAVE_FROM_GROUP: "userLeaveFromGroup",
};

export default ChatEvents;
