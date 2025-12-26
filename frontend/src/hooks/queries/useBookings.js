import { useQuery } from "@tanstack/react-query";
import { getBookingById, getMyBookings } from "../../api/booking.api";
import { useAuthGate } from "../useAuthGate";

export const useMyBookingsQuery = () => {
  const { isAuthed } = useAuthGate();

  return useQuery({
    queryKey: ["myBookings"],
    enabled: isAuthed,
    queryFn: getMyBookings,
    staleTime: 1000 * 10, // 10s
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
  });
};

export const useBookingById = (id) => {
  const { isAuthed } = useAuthGate();

  return useQuery({
    queryKey: ["booking", id],
    enabled: isAuthed,
    queryFn: () => getBookingById(id),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
  });
};
