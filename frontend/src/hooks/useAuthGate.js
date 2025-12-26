import { useCurrentUser } from "./queries/useAuth";

export const useAuthGate = () => {
  const { data, isLoading, isError } = useCurrentUser();

  return {
    isAuthed: !!data && !isError,
    isLoading,
  };
};
