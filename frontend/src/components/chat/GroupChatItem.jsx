const GroupChatItem = ({ chat, onSelectChat, unreadCount, isActive }) => {
  return (
    <div
      className={` p-2 rounded-md cursor-pointer mb-2 flex relative ${
        isActive ? "bg-blue-600" : "bg-slate-600"
      }`}
      onClick={() => {
        onSelectChat(chat);
      }}
    >
      <p className="absolute right-5 top-5 px-2 bg-green-600 rounded-full text-white">
        {unreadCount > 9 ? "9+" : unreadCount}
      </p>
      <div className="relative flex w-16">
        <img src="profile (1).png" className="w-12 rounded-full  relative " />
        <img
          src="profile (2).png"
          className="w-12 rounded-full relative right-10"
        />
        <img
          src="profile (1).png"
          className="w-12 rounded-full relative right-20"
        />
      </div>
      <div className="ml-2 ">
        <div>
          <h2>{chat.name}</h2>
        </div>
        {chat.lastMessage
          ? chat.lastMessage.content
            ? chat.lastMessage.content
            : "Image"
          : "No message yet"}
      </div>
    </div>
  );
};

export default GroupChatItem;
