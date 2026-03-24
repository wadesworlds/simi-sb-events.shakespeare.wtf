import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHead, UnheadProvider } from '@unhead/react/client';
import { InferSeoMetaPlugin } from '@unhead/addons';
import { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppRouter from './AppRouter';

const head = createHead({
  plugins: [InferSeoMetaPlugin()],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000,
      gcTime: Infinity,
    },
  },
});

export function App() {
  return (
    <UnheadProvider head={head}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Suspense>
            <AppRouter />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    </UnheadProvider>
  );
}

export default App;
