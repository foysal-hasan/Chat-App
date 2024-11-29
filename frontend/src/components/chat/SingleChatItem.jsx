import { useAuth } from "../../context/AuthContext";

const SingleChatItem = ({ chat, setSelectedChat, unreadCount, isActive }) => {
  const { user } = useAuth();
  const findName = (chat) => {
    const f = chat.participants.find((c) => c._id !== user._id);
    return f.username;
  };

  return (
    <div
      className={` p-2 rounded-md cursor-pointer mb-2 flex relative ${
        isActive ? "bg-blue-600" : "bg-slate-600"
      }`}
      onClick={() => {
        setSelectedChat(chat);
      }}
    >
      <p className="absolute right-5 top-5 px-2 bg-green-600 rounded-full text-white">
        {unreadCount > 9 ? "9+" : unreadCount}
      </p>
      <img
        src="profile-img.png"
        className="w-12 rounded-full mr-2 border border-black"
      />

      <div>
        <div>
          <h2>{findName(chat)}</h2>
        </div>
        <p>
          {chat.lastMessage
            ? chat.lastMessage.content
              ? chat.lastMessage.content
              : "Image"
            : "No message yet"}
        </p>
      </div>
    </div>
  );
};

export default SingleChatItem;
