import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "../../api/booking.api";
import { useAuthGate } from "../useAuthGate";

export const useMyBookingsQuery = () => {
  const { isAuthed } = useAuthGate();

  return useQuery({
    queryKey: ["myBookings"],
    enabled: isAuthed,
    queryFn: getMyBookings,
    staleTime: 1000 * 30,
  });
};
