import {
  TrashIcon,
  UserGroupIcon,
  UserPlusIcon,
  PencilSquareIcon,
} from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import {
  deleteGroup,
  deleteOneOnOneChat,
  leaveGroupChat,
  removeParticipantFromGroup,
  updateGroupName,
} from "../../api";
import { useState } from "react";
import AddParticipants from "./AddParticipant";

const AboutSidebar = ({ chat, currentUserId, setIsOpen, fetchChat }) => {
  const isGroupChat = chat.isGroupChat;
  const isAdmin = chat.admin === currentUserId;
  const [chatName, setChatName] = useState(chat.name);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpenAddParticipant, setIsOpenAddParticipant] = useState(false);

  const handleDelete = async () => {
    try {
      if (!isGroupChat) {
        // delete one on one chat
        await deleteOneOnOneChat(chat?._id);
      } else if (isGroupChat && isAdmin) {
        // delete group chat
        await deleteGroup(chat?._id);
      } else {
        // if it's group chat but requested user is not admin then show a error toast
        toast.error("Your are not authorized to delete this chat");
      }
    } catch (error) {
      toast.error("Server Error");
    } finally {
      setIsOpen(false);
    }
  };

  const handleOnSave = async () => {
    try {
      await updateGroupName(chat._id, chatName);
      toast.success("Group name updated successfully");
    } catch (error) {
      toast.error("Server Error");
    } finally {
      setIsEdit(false);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveGroupChat(chat._id);
      toast.success("Leave successful");
    } catch (error) {
      toast.error("Server Error");
    }
  };

  const handleRemove = async (participantId) => {
    try {
      await removeParticipantFromGroup(chat._id, participantId);
      toast.success("Removed successfully");
      fetchChat();
    } catch (error) {
      toast.error("Server Error");
    }
  };

  return (
    <>
      <AddParticipants
        isOpen={isOpenAddParticipant}
        setIsOpen={setIsOpenAddParticipant}
        groupId={chat._id}
        currentParticipants={chat.participants}
        fetchChat={fetchChat}
      />
      <div className="  p-4  h-full flex flex-col">
        <h3 className="text-2xl text-center font-semibold mb-4">
          {isGroupChat ? "Group Info" : "Chat Info"}
        </h3>

        {/* Chat Details */}
        <div className="mb-4">
          {isGroupChat && isAdmin ? (
            <div className="flex items-center justify-between">
              <input
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                className={`w-80 outline-none text-orange-500 border rounded-md p-2 text-3xl ${
                  isEdit ? "bg-slate-900" : "bg-gray-600"
                }`}
                disabled={!isEdit}
              />
              {isEdit ? (
                <button
                  className="bg-green-600 px-6 py-2 rounded-3xl"
                  onClick={handleOnSave}
                >
                  Save
                </button>
              ) : (
                <button
                  className="bg-blue-500 px-6 py-2 rounded-3xl"
                  onClick={() => setIsEdit(true)}
                >
                  <PencilSquareIcon className="w-5 h-5 inline-block mb-1 mr-1" />
                  Edit
                </button>
              )}
            </div>
          ) : (
            <h1 className=" text-3xl text-center py-2 text-orange-500  rounded-lg">
              {chat.name}
            </h1>
          )}
        </div>

        {/* Users List */}
        <div className="mb-4">
          <h4 className="text-md font-semibold mb-2">
            <UserGroupIcon className="h-6 w-6 mb-1 mr-2 inline-block" />{" "}
            {chat?.participants.length} Participants
          </h4>
          <ul className="space-y-2 overflow-x-hidden overflow-y-auto max-h-[calc(100vh-310px)] scrollbar-none">
            {chat.participants.map((user) => (
              <li
                key={user._id}
                className="flex items-center justify-between  px-4 py-2  shadow-sm border-b w-full"
              >
                <div className="flex items-center justify-between flex-1">
                  <div className="flex">
                    <img
                      src="profile-img.png"
                      alt={user.username}
                      className="inline-block w-12 mr-2"
                    />
                    <div>
                      <div className="flex items-center">
                        <h4 className="inline-block">{user.username}</h4>
                        {user._id === currentUserId && (
                          <span className="text-xs text-white-500 bg-green-800 font-semibold border p-1 px-2 rounded-xl ml-2">
                            you
                          </span>
                        )}
                        {isGroupChat && user._id === chat.admin && (
                          <span className="text-xs text-blue-500 bg-slate-900 font-semibold border p-1 px-2 rounded-xl ml-2">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  {isGroupChat && isAdmin && user._id !== chat.admin && (
                    <button
                      className="bg-red-500 px-4 py-1 rounded-2xl"
                      onClick={() => handleRemove(user._id)}
                    >
                      Remove
                    </button>
                  )}
                  {isGroupChat && user._id === currentUserId && !isAdmin && (
                    <button
                      className="bg-red-500 px-4 py-1 rounded-2xl"
                      onClick={handleLeave}
                    >
                      Leave
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          {isGroupChat && isAdmin && (
            <button
              onClick={() => setIsOpenAddParticipant(true)}
              className="w-full bg-blue-700 block mb-2 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition"
            >
              <UserPlusIcon className="h-5 w-5 inline-block mb-1 mr-2" />
              Add Participant
            </button>
          )}
          {(!isGroupChat || isAdmin) && (
            <button
              onClick={handleDelete}
              className="w-full bg-red-500 block text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
            >
              <TrashIcon className="h-5 w-5 inline-block mb-1 mr-2" />
              Delete Chat
            </button>
          )}
          {isGroupChat && !isAdmin && (
            <p className="text-sm text-red-500 text-center">
              Only the admin can delete this chat.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default AboutSidebar;
