import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function QueryProvider({ children }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 0,
        placeholderData: null,
        retry: (failureCount, error) => {
          const status = Number(error?.response?.status);
          // خطاهای احراز هویت و دسترسی با تکرار درخواست حل نمی‌شوند.
          if (status === 401 || status === 403) return false;
          // برای خطاهای موقت شبکه/سرور حداکثر یک بار تلاش مجدد کافی است.
          return failureCount < 1 && (!status || status >= 500);
        },
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
