import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "../../api/booking.api";

export const useMyBookingsQuery = (enabled = true) =>
  useQuery({
    queryKey: ["myBookings"],
    enabled,
    queryFn: getMyBookings,
    staleTime: 1000 * 30,
  });
