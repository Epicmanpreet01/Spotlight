import { ThemeProvider } from "../src/context/ThemeContext";
import AuthBootstrap from "../src/context/AuthBootstrap";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthBootstrap />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
