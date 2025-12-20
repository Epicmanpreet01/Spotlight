import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessageRest, markChatRead } from "../../api/chat.api";

export const useSendMessageMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: sendMessageRest,
    onSuccess: (_, { chatId }) => {
      qc.invalidateQueries(["chatMessages", chatId]);
      qc.invalidateQueries(["myChats"]);
    },
  });
};

export const useMarkChatReadMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: markChatRead,
    onSuccess: () => {
      qc.invalidateQueries(["myChats"]);
    },
  });
};
