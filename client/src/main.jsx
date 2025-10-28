import { StrictMode } from "react";
import { createRoot } from "react-dom/client"; // Use createRoot from react-dom/client
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ContextApiProvider } from "./context/ContextApiProvider.jsx";
import { ClerkProvider } from '@clerk/clerk-react';
import 'react-toastify/dist/ReactToastify.css';


// New TanStack Query Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

// 1. Create a Query Client instance
const queryClient = new QueryClient();

// 2. Use createRoot for modern React rendering
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 3. Nest ALL Providers at the top level
      The order can vary, but generally, global providers come first.
      QueryClientProvider must wrap any component (like App) that uses useQuery.
    */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <ContextApiProvider>
          {/* QueryClientProvider is added here to wrap all consumers */}
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </ContextApiProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);