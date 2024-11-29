import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import AboutSidebar from "./AboutSidebar";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { getGroupInfo } from "../../api";
import { toast } from "react-toastify";

// eslint-disable-next-line react/prop-types
const AboutDialog = ({ isOpen, setIsOpen, chatId }) => {
  const { user } = useAuth();
  const [chat, setChat] = useState(null);

  const fetchChat = async () => {
    try {
      const { data } = await getGroupInfo(chatId);
      setChat(data.groupChat);
    } catch (error) {
      toast.error("Server Error");
    }
  };

  useEffect(() => {
    fetchChat();
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-end text-white  bg-slate-900/80  ">
        <DialogPanel className="w-2/5 h-full space-y-2 bg-slate-800 p-6 bl shadow-xl">
          <AboutSidebar
            chat={chat}
            currentUserId={user._id}
            setIsOpen={setIsOpen}
            fetchChat={fetchChat}
          />
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default AboutDialog;
