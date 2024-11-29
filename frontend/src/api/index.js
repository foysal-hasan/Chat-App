// Import necessary modules and utilities
import axios from "axios";

// Create an Axios instance for API requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  withCredentials: true,
  timeout: 120000,
});

// Add an interceptor to set authorization header with user token before requests
apiClient.interceptors.request.use(
  function (config) {
    // Retrieve user token from local storage
    const token = localStorage.getItem("token")
      ? JSON.parse(localStorage.getItem("token"))
      : null;
    // Set authorization header with bearer token
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// API functions for different actions
const loginUser = (data) => {
  return apiClient.post("/api/users/login", data);
};

const registerUser = (data) => {
  return apiClient.post("/api/users", data);
};

const logoutUser = () => {
  return apiClient.post("/api/users/logout");
};

const getAvailableUsers = (search) => {
  return apiClient.get("/api/users", {
    params: { search },
  });
};

const getUserChats = () => {
  return apiClient.get(`/api/chats`);
};

const createUserChat = (receiverId) => {
  return apiClient.post(`/api/chats/c/${receiverId}`);
};

const createGroupChat = (data) => {
  return apiClient.post(`/api/chats/group`, data);
};

const getGroupInfo = (chatId) => {
  return apiClient.get(`/api/chats/group/${chatId}`);
};

const updateGroupName = (chatId, name) => {
  return apiClient.patch(`/api/chats/group/${chatId}`, { name });
};

const deleteGroup = (chatId) => {
  return apiClient.delete(`/api/chats/group/${chatId}`);
};

const deleteOneOnOneChat = (chatId) => {
  return apiClient.delete(`/api/chats/remove/${chatId}`);
};

const addParticipantToGroup = (chatId, participantId) => {
  return apiClient.post(`/api/chats/group/${chatId}/${participantId}`);
};

const removeParticipantFromGroup = (chatId, participantId) => {
  return apiClient.delete(`/api/chats/group/${chatId}/${participantId}`);
};

const leaveGroupChat = (chatId) => {
  return apiClient.delete(`/api/chats/leave/group/${chatId}`);
};

const getChatMessages = (chatId) => {
  return apiClient.get(`/api/messages/${chatId}`);
};

const sendMessage = (chatId, content, attachments) => {
  const formData = new FormData();

  if (content) {
    formData.append("content", content);
  }
  attachments?.map((file) => {
    formData.append("attachments", file);
  });
  console.log(formData);

  return apiClient.post(`/api/messages/${chatId}`, formData);
};

const deleteMessage = (chatId, messageId) => {
  return apiClient.delete(`/api/messages/${chatId}/${messageId}`);
};

// Export all the API functions
export {
  addParticipantToGroup,
  createGroupChat,
  createUserChat,
  deleteGroup,
  deleteOneOnOneChat,
  getAvailableUsers,
  getChatMessages,
  getGroupInfo,
  getUserChats,
  loginUser,
  logoutUser,
  registerUser,
  removeParticipantFromGroup,
  sendMessage,
  updateGroupName,
  deleteMessage,
  leaveGroupChat,
};
