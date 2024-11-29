/* eslint-disable react/prop-types */

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AboutDialog from "./AboutDialog";
import AddParticipants from "./AddParticipant";

const ChatHeader = ({ chat }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenAddParticipant, setIsOpenAddParticipant] = useState(false);

  const findName = (chat) => {
    const f = chat.participants.find((c) => c._id !== user._id);
    return f.username;
  };
  return (
    <div className="px-4 py-2 flex justify-between items-center border-b-2 border-cyan-500 shadow-md">
      {chat?.isGroupChat ? (
        <div className="flex items-center">
          <div className="relative flex w-16 mr-4">
            <img
              src="profile (1).png"
              className="w-12 rounded-full  relative "
            />
            <img
              src="profile (2).png"
              className="w-12 rounded-full relative right-10"
            />
            <img
              src="profile (1).png"
              className="w-12 rounded-full relative right-20"
            />
          </div>
          <span className="text-white text-lg font-bold">{chat.name}</span>
        </div>
      ) : (
        <div className="flex items-center">
          <img src="profile-img.png" className="w-12 rounded-full mr-2" />
          <span className="text-white text-lg font-bold">{findName(chat)}</span>
        </div>
      )}

      <button
        onClick={() => setIsOpen(true)}
        className="mr-6  uppercase bg-blue-700 font-semibold px-4 py-2 rounded-md"
      >
        About
      </button>
      <AboutDialog isOpen={isOpen} setIsOpen={setIsOpen} chatId={chat._id} />
      {/* <AddParticipants
        isOpen={isOpenAddParticipant}
        setIsOpen={setIsOpenAddParticipant}
        groupId={chat._id}
        currentParticipants={chat.participants}
      /> */}
    </div>
  );
};

export default ChatHeader;
