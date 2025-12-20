import { useQuery } from "@tanstack/react-query";
import { getMyChats, getChatMessages } from "../../api/chat.api";

export const useMyChatsQuery = () =>
  useQuery({
    queryKey: ["myChats"],
    queryFn: getMyChats,
  });

export const useChatMessagesQuery = (chatId) =>
  useQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: () => getChatMessages(chatId),
    enabled: !!chatId,
  });
