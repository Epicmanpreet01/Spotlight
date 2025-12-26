import api from "./api";

export const getMyChats = async () => {
  const res = await api.get("/chat");
  return res.data;
};

export const getChatById = async (chatId) => {
  const res = await api.get(`/chat/${chatId}`);
  return res.data;
};

export const getChatMessages = async (chatId, page = 1) => {
  const res = await api.get(`/chat/${chatId}/messages`, {
    params: { page },
  });
  return res.data;
};

export const sendMessageRest = async ({ chatId, text }) => {
  const res = await api.post(`/chat/${chatId}/messages`, { text });
  return res.data;
};

export const markChatRead = async (chatId) => {
  const res = await api.put(`/chat/${chatId}/read`);
  return res.data;
};
