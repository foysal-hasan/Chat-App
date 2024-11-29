import {
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

const TYPING_EVENT = "typing";
const STOP_TYPING_EVENT = "stopTyping";

const ChatMessageInput = ({ onSendMessage, chat }) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const { socket } = useSocket();
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message && attachments?.length === 0) {
      return;
    }
    socket.emit(STOP_TYPING_EVENT, chat._id);
    onSendMessage(message, attachments);
    setMessage("");
    setAttachments([]);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!socket || !user) return;
    if (!isTyping) {
      setIsTyping(true);
      socket.emit(TYPING_EVENT, chat._id); // Replace 'username' with actual username
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit(STOP_TYPING_EVENT, chat._id);
      }, 3000);
    }
  };

  return (
    <div className="bg-slate-600">
      {attachments.length > 0 ? (
        <div className="grid gap-4 grid-cols-5 p-4 justify-start max-w-fit">
          {attachments.map((file, i) => {
            return (
              <div
                key={i}
                className="group w-32 h-32 relative aspect-square rounded-xl cursor-pointer"
              >
                <div className="absolute inset-0 flex justify-center items-center w-full h-full bg-black/40 group-hover:opacity-100 opacity-0 transition-opacity ease-in-out duration-150">
                  <button
                    onClick={() => {
                      setAttachments(attachments.filter((_, ind) => ind !== i));
                    }}
                    className="absolute -top-2 -right-2"
                  >
                    <XCircleIcon className="h-6 w-6 text-white" />
                  </button>
                </div>
                <img
                  className="h-full rounded-xl w-full object-cover"
                  src={URL.createObjectURL(file)}
                  alt="attachment"
                />
              </div>
            );
          })}
        </div>
      ) : null}
      <form
        onSubmit={handleSubmit}
        className=" p-4 flex bottom-0 relative w-3/4 mx-auto"
      >
        <label htmlFor="attachments">
          <PaperClipIcon className="w-6 h-full mr-2" />
        </label>
        <input
          hidden
          type="file"
          id="attachments"
          multiple
          accept="image/*"
          onChange={(e) => setAttachments([...e.target.files])}
        />
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 p-2 rounded-l-lg bg-slate-700 outline-none"
          value={message}
          onChange={handleTyping}
          name="content"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 border border-blue-600  text-white font-bold py-2 px-4 rounded-r-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatMessageInput;
