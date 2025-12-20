import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markAllNotificationsRead,
  deleteAllNotifications,
} from "../../api/notification.api";

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useDeleteAllNotifications = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      qc.setQueryData(["notifications"], []);
    },
  });
};
