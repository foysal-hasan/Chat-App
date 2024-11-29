import { Switch } from "@headlessui/react";
import { useState } from "react";
import { createGroupChat, createUserChat, getAvailableUsers } from "../../api";
import { toast } from "react-toastify";

const ChatSelector = ({ setIsOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [name, setName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);

  // Fetch users dynamically from backend
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      try {
        const response = await getAvailableUsers(value.trim());
        setSearchResults(response.data); // Assuming API returns a list of users
      } catch (error) {
        toast.error("Server Error");
        setSearchResults([]); // Reset search results on error
      }
    } else {
      setSearchResults([]); // Clear results when input is empty
    }
  };

  // Add user to selected list
  const handleSelectUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      toast.warn(`${user.username} already seleted`);
      return;
    }
    if (!isGroupChat && selectedUsers.length >= 1) {
      toast.warn(`You can't select more than one user for one-to-one chat`);
      return;
    }
    if (
      (!isGroupChat && selectedUsers.length >= 1) ||
      selectedUsers.some((u) => u._id === user._id)
    ) {
      return; // Prevent adding more than one for single chat or duplicates
    }

    setSelectedUsers((prev) => [...prev, user]);
    setSearchTerm(""); // Clear search input
    setSearchResults([]); // Clear search results
  };

  // Remove user from selected list
  const handleRemoveUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((user) => user._id !== userId));
  };

  const createChat = async () => {
    if (selectedUsers.length === 0) {
      toast.warn("Select more people to create chat");
      return;
    }
    if (!isGroupChat && selectedUsers.length > 1) {
      toast.warn("Choose one to create one-to-one chat");
      return;
    }

    if (isGroupChat && selectedUsers.length < 2) {
      toast.warn("To create group you need more users");
      return;
    }

    if (isGroupChat && !name.trim()) {
      toast.warn("To create group name field can't be empty");
      return;
    }

    const participants = selectedUsers.map((user) => user._id);
    try {
      if (isGroupChat) {
        const { data } = await createGroupChat({
          name,
          participants,
        });
        console.log(data);
      } else {
        const { data } = await createUserChat(participants[0]);
        console.log(data);
      }
    } catch (error) {
      toast.error("Server Error");
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto text-white">
      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <span className="mr-2"> Is Group Chat?</span>
          <div className="py-3">
            <Switch
              checked={isGroupChat}
              onChange={setIsGroupChat}
              className={`${isGroupChat ? "bg-blue-700" : "bg-slate-500"}
          relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
            >
              <span className="sr-only">Use setting</span>
              <span
                aria-hidden="true"
                className={`${isGroupChat ? "translate-x-9" : "translate-x-0"}
            pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>
        </label>
      </div>

      {isGroupChat && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group Name"
          className="w-full px-4 py-2 border bg-slate-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
      )}

      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search for users..."
        className="w-full px-4 py-2 border bg-slate-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
      />

      {searchResults.length > 0 && (
        <ul className="border border-gray-300 rounded-lg mb-4 max-h-40 overflow-y-auto">
          {searchResults.map((user) => (
            <li
              key={user._id}
              className="px-4 py-2 cursor-pointer bg-slate-900 hover:bg-slate-700"
              onClick={() => handleSelectUser(user)}
            >
              {user.username}
            </li>
          ))}
        </ul>
      )}

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
            >
              <span>{user.username}</span>
              <button
                onClick={() => handleRemoveUser(user._id)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={createChat}
        className="bg-blue-700 w-full py-2 uppercase font-semibold rounded-xl"
      >
        Create
      </button>
    </div>
  );
};

export default ChatSelector;
