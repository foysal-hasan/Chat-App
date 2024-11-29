import { useEffect, useRef, useState } from "react";
import AddUserOrGroupModal from "../components/AddUserOrGroupModal";
import { getUserChats, getChatMessages, sendMessage } from "../api";
import { UserPlusIcon } from "@heroicons/react/20/solid";
import Loader from "../components/Loader";
import SingleChatItem from "../components/chat/SingleChatItem";
import GroupChatItem from "../components/chat/GroupChatItem";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessageInput from "../components/chat/ChatInput";
import ChatMessageList from "../components/chat/ChatMessageList";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-toastify";

const filterChats = (chats, localSearchQuery) => {
  if (!localSearchQuery.trim()) return chats; // Return all chats if search query is empty

  return chats.filter((chat) => {
    if (chat.isGroupChat) {
      // Filter group chats based on the name
      return chat.name.toLowerCase().includes(localSearchQuery.toLowerCase());
    } else {
      // Filter one-to-one chats based on participants' usernames
      return chat.participants.some((participant) =>
        participant.username
          .toLowerCase()
          .includes(localSearchQuery.toLowerCase())
      );
    }
  });
};

const CONNECTED_EVENT = "connected";
const DISCONNECT_EVENT = "disconnect";
const JOIN_CHAT_EVENT = "joinChat";
const NEW_CHAT_EVENT = "newChat";
const TYPING_EVENT = "typing";
const STOP_TYPING_EVENT = "stopTyping";
const MESSAGE_RECEIVED_EVENT = "messageReceived";
const LEAVE_CHAT_EVENT = "leaveChat";
const UPDATE_GROUP_NAME_EVENT = "updateGroupName";
const ADD_PARTICIPANT_TO_GROUP = "addParticipantToGroup";
const REMOVE_PARTICIPANT_FROM_GROUP = "removeParticipantFromGroup";
const USER_LEAVE_FROM_GROUP = "userLeaveFromGroup";

const ChatPage = () => {
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const currentChat = useRef(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingMessages, setPendingMessages] = useState({});
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  const updateChatLastMessage = (chatToUpdateId, message) => {
    if (!chatToUpdateId) return;
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === chatToUpdateId
          ? {
              ...chat,
              lastMessage: message,
              updatedAt: message?.updatedAt,
            }
          : chat
      )
    );
  };

  const getChats = async () => {
    try {
      const { data } = await getUserChats();
      setChats(data.chats);
      console.log(data.chats);
    } catch (error) {
      console.log(error);
      toast.error("Server Error");
    }
  };

  const getMessages = async () => {
    try {
      setMessageLoading(true);
      const { data } = await getChatMessages(currentChat.current._id);
      setMessages(data.messages);
      // console.log(messages);
    } catch (error) {
      console.log(error);
      toast.error("Server Error");
    } finally {
      setMessageLoading(false);
    }
  };

  const sendChatMessage = async (message, attachedFiles) => {
    try {
      const { data } = await sendMessage(
        currentChat.current?._id || "",
        message,
        attachedFiles
      );
      setMessages((prev) => [...prev, data.receivedMessage]);
      updateChatLastMessage(
        currentChat.current?._id || "",
        data.receivedMessage
      );
    } catch (error) {
      console.log(error);
    }
  };

  const onConnect = () => {
    setIsConnected(true);
  };

  const onDisconnect = () => {
    setIsConnected(false);
  };

  const onNewChat = (chat) => {
    setChats((prev) => [chat, ...prev]);
  };
  const onChatLeave = (chat) => {
    if (currentChat.current?._id === chat._id) {
      currentChat.current = null;
    }

    setChats((prev) => prev.filter((c) => c._id !== chat._id));
  };

  // typing
  const handleOnSocketTyping = (chatId) => {
    if (currentChat.current?._id !== chatId) return;
    setIsTyping(true);
  };

  const handleOnSocketStopTyping = (chatId) => {
    if (currentChat.current?._id !== chatId) return;
    setIsTyping(false);
  };

  const onMessageReceived = (message) => {
    if (message.chat !== currentChat.current?._id) {
      setPendingMessages((prevUnread) => ({
        ...prevUnread,
        [message.chat]: [...(prevUnread[message.chat] || []), message],
      }));
    } else {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, message];
        // console.log("Message added to current chat:", updatedMessages);
        return updatedMessages;
      });
    }

    updateChatLastMessage(message.chat, message);
  };

  const onGroupNameChange = (chat) => {
    setChats((prev) =>
      prev.map((c) => {
        if (chat._id === c._id) {
          return chat;
        }
        return c;
      })
    );
  };

  const onParticipantsUpdate = (chat) => {
    setChats((prev) =>
      prev.map((c) => {
        if (chat._id === c._id) {
          return chat;
        }
        return c;
      })
    );
  };

  const markChatAsRead = (chatId) => {
    setPendingMessages((prevUnread) => {
      const { [chatId]: _, ...rest } = prevUnread; // Remove the specific chat's unread messages
      return rest;
    });
  };

  const onSelectChat = (chat) => {
    currentChat.current = chat;
    // console.log(currentChat.current);
    if (!currentChat.current?._id) return;
    socket.emit(JOIN_CHAT_EVENT, currentChat.current._id);
    markChatAsRead(currentChat.current?._id);
    getMessages();
  };

  useEffect(() => {
    getChats();
  }, []);

  // useEffect(() => {
  //   console.log(currentChat.current);

  // }, [currentChat.current]);

  useEffect(() => {
    if (!socket) return;

    // Listener for when the socket connects.
    socket.on(CONNECTED_EVENT, onConnect);
    // Listener for when the socket disconnects.
    socket.on(DISCONNECT_EVENT, onDisconnect);
    // Listener for the initiation of a new chat.
    socket.on(NEW_CHAT_EVENT, onNewChat);
    // Listener for when a user leaves a chat.
    socket.on(LEAVE_CHAT_EVENT, onChatLeave);
    // Listener for when a user is typing.
    socket.on(TYPING_EVENT, handleOnSocketTyping);
    // Listener for when a user stops typing.
    socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
    // Listener for when a new message is received.
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    // Listener for when a group's name is updated.
    socket.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);

    socket.on(ADD_PARTICIPANT_TO_GROUP, onParticipantsUpdate);
    socket.on(REMOVE_PARTICIPANT_FROM_GROUP, onParticipantsUpdate);
    socket.on(USER_LEAVE_FROM_GROUP, onParticipantsUpdate);

    return () => {
      socket.off(CONNECTED_EVENT, onConnect);
      socket.off(DISCONNECT_EVENT, onDisconnect);
      socket.off(NEW_CHAT_EVENT, onNewChat);
      socket.off(LEAVE_CHAT_EVENT, onChatLeave);
      socket.off(TYPING_EVENT, handleOnSocketTyping);
      socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      socket.off(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
      socket.off(ADD_PARTICIPANT_TO_GROUP, onParticipantsUpdate);
      socket.off(REMOVE_PARTICIPANT_FROM_GROUP, onParticipantsUpdate);
      socket.off(USER_LEAVE_FROM_GROUP, onParticipantsUpdate);
    };
  }, [socket]);

  if (!isConnected) <Loader />;
  return (
    <>
      <AddUserOrGroupModal isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex">
        <div className="w-[500px] min-h-screen p-4 border-r-2 border-cyan-600">
          <div className="flex justify-between mb-4">
            <input
              type="text"
              placeholder="Search user or group"
              className="p-2 text-md rounded border-2 border-cyan-600 text-white outline-0 bg-slate-500 focus:border-white"
              value={localSearchQuery}
              onChange={(e) =>
                setLocalSearchQuery(e.target.value.toLowerCase())
              }
            />
            <button
              className="px-4 py-2 bg-blue-600 rounded text-center text-white"
              onClick={() => setIsOpen(true)}
            >
              <UserPlusIcon className="w-5 h-5 inline-block mr-0.5 mb-0.5" />{" "}
              Add Chat
            </button>
          </div>
          <div
            className={`text-white pr-2 overflow-x-hidden overflow-y-auto scrollbar-none`}
            style={{ height: "calc(100vh - 90px)" }}
          >
            {chats.length > 0 ? (
              filterChats(chats, localSearchQuery).map((chat) => (
                <div key={chat._id}>
                  {chat.isGroupChat === true ? (
                    <GroupChatItem
                      isLoading={messageLoading}
                      chat={chat}
                      onSelectChat={onSelectChat}
                      unreadCount={pendingMessages[chat._id]?.length}
                      isActive={currentChat.current?._id === chat._id}
                    />
                  ) : (
                    <SingleChatItem
                      unreadCount={pendingMessages[chat._id]?.length}
                      chat={chat}
                      setSelectedChat={onSelectChat}
                      isActive={currentChat.current?._id === chat._id}
                      selectedChatId={currentChat.current?._id}
                    />
                  )}
                </div>
              ))
            ) : (
              <Loader />
            )}
          </div>
        </div>
        <div className="w-screen min-h-screen text-white">
          {currentChat.current ? (
            <div className=" w-full min-h-screen max-h-screen flex flex-col">
              <ChatHeader chat={currentChat.current} />
              <ChatMessageList
                messages={messages}
                isTyping={isTyping}
                isLoading={messageLoading}
              />
              <ChatMessageInput
                onSendMessage={sendChatMessage}
                chat={currentChat.current}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center w-full h-full">
              <p>No chat selected yet!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
