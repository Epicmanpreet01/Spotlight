import { ThemeProvider } from "../src/context/ThemeContext";
import AuthBootstrap from "../src/context/AuthBootstrap";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 5,
      retryDelay: (attempt) => Math.min(1000 * attempt, 10000),
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthBootstrap />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
