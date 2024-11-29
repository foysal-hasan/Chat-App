import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import Typing from "../chat/Typing";
import Loader from "../Loader";

const ChatMessageList = ({ messages, isTyping, isLoading }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const openImageModal = (image) => {
    setSelectedImage(image); // Set the selected image
  };

  const closeImageModal = () => {
    setSelectedImage(null); // Clear the selected image
  };

  return (
    <>
      {/* Chat Messages */}
      <div
        className="flex flex-col h-full overflow-y-auto p-4 flex-1 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200"
        ref={messagesEndRef}
      >
        {isLoading && <Loader />}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex mb-2 ${
              message.sender?._id === user?._id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs ${
                message.sender?._id === user?._id ? "text-right" : "text-left"
              }`}
            >
              {/* Display Sender Name */}
              <p>{message.sender?.username}</p>

              {/* Message Content and Attachments */}
              <div className="bg-blue-600 p-3 rounded-lg">
                {/* Display Content if Available */}
                {message.content && (
                  <p className="text-white mb-2">{message.content}</p>
                )}

                {/* Display Attachments if Available */}
                {message.attachments?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.attachments.map((image, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={`${import.meta.env.VITE_SERVER_URI}${image}`} // Use the image URL
                        alt={`Attachment ${imgIndex + 1}`}
                        className="w-96 object-cover rounded-lg cursor-pointer"
                        onClick={() =>
                          openImageModal(
                            `${import.meta.env.VITE_SERVER_URI}${image}`
                          )
                        }
                        onLoad={scrollToBottom}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-xs text-gray-500">
                {new Date(message.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
        {isTyping && <Typing />}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
          onClick={closeImageModal} // Close modal on background click
        >
          <div className="relative">
            <button
              className="absolute top-2 right-2 text-white bg-gray-800 rounded-full p-2 px-3 focus:outline-none"
              onClick={closeImageModal} // Close modal on button click
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Full Screen"
              className="max-w-full max-h-screen rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMessageList;
