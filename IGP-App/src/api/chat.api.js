import api from "../api/api.js";

export const getMyChats = async () => {
  const res = await api.get("/chat");
  return res.data;
};

export const getChatMessages = async (chatId) => {
  const res = await api.get(`/chat/${chatId}/messages`);
  return res.data;
};

export const postMessage = async (chatId, body) => {
  const res = await api.post(`/chat/${chatId}/messages`, body);
  return res.data;
};
