import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import ChatSelector from "./chat/ChatSelector";

const AddUserOrGroupModal = ({ isOpen, setIsOpen }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center  bg-slate-900/80  ">
        <DialogPanel className="w-96 space-y-2 bg-slate-800 p-6 rounded-xl bl shadow-xl">
          <DialogTitle className="font-semibold text-white text-xl pl-4">
            Create Chat
          </DialogTitle>
          <ChatSelector setIsOpen={setIsOpen} />
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default AddUserOrGroupModal;
