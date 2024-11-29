import { useState } from "react";
import { getAvailableUsers, addParticipantToGroup } from "../../api"; // Replace with actual API functions
import { toast } from "react-toastify";
import { Dialog, DialogPanel } from "@headlessui/react";

const AddParticipants = ({
  groupId,
  currentParticipants,
  setIsOpen,
  isOpen,
  fetchChat,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Stores the currently selected user

  // Fetch users dynamically from backend
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      try {
        const response = await getAvailableUsers(value.trim());
        setSearchResults(
          response.data.filter(
            (user) => !currentParticipants.some((p) => p._id === user._id)
          )
        ); // Exclude existing participants
      } catch (error) {
        toast.error("Users not found");
        setSearchResults([]); // Reset search results on error
      }
    } else {
      setSearchResults([]); // Clear results when input is empty
    }
  };

  // Handle selection of a user
  const handleSelectChange = (e) => {
    console.log(e.target.value);

    const userId = e.target.value;
    const user = searchResults.find((user) => user._id === userId);
    setSelectedUser(user);
  };

  // Add the selected participant to the group
  const addParticipant = async () => {
    if (!selectedUser) {
      toast.warn("Select a user to add to the group");
      return;
    }

    try {
      await addParticipantToGroup(groupId, selectedUser._id);
      toast.success("Participant added successfully!");
      fetchChat();
    } catch (error) {
      toast.error("Failed to add participant");
    } finally {
      setIsOpen(false); // Close the dialog
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-end text-white  bg-slate-900/80  ">
        <DialogPanel className="w-2/5 h-full space-y-2 bg-slate-800 p-6 bl shadow-xl">
          <div className="p-4 max-w-lg mx-auto text-white">
            <h3 className="text-lg font-semibold mb-4">Add Participant</h3>

            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search for users..."
              className="w-full px-4 py-2 border bg-slate-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
            />

            {searchResults.length > 0 && (
              <div className="mb-4">
                <select
                  className="w-full px-4 py-2 border bg-slate-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onChange={handleSelectChange}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a user
                  </option>
                  {searchResults.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={addParticipant}
              className="bg-blue-700 w-full py-2 uppercase font-semibold rounded-xl"
            >
              Add Participant
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default AddParticipants;
