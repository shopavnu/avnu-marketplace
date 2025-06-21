import "../styles/globals.css";
import "../styles/checkout.css";
import "../styles/toast.css";
import "../styles/accessibility.css";

import "../styles/product-card.css"; // Import product card consistent styling
import type { AppProps } from "next/app";
import ApolloProvider from "../providers/ApolloProvider";
import { Layout, EnhancedLayout } from "../components/layout";
import ApiUrlDebug from "../components/debug/ApiUrlDebug";
import ErrorBoundary from "../components/common/ErrorBoundary";
import GraphQLErrorHandler from "../components/common/GraphQLErrorHandler";
import { useRouter } from "next/router";
import { ThemeProvider } from "../context/ThemeContext";
import { useEffect } from "react";
import useCartSync from "@/hooks/useCartSync";
import useCartSocket from "@/hooks/useCartSocket";
// Removed ChakraProvider imports as they're causing SSR errors

import { initializePersonalization } from "../utils/discovery-integration";
import { ClerkProvider } from "@clerk/nextjs";
import { geistSans, geistMono } from "../utils/fonts";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // Cross-tab cart synchronisation
  useCartSync();
  // Live, multi-device cart synchronisation via WebSocket
  useCartSocket();

  // Initialize personalization service on client-side
  useEffect(() => {
    initializePersonalization();
  }, []);

  // Use EnhancedLayout for the homepage and product pages, regular Layout for admin/merchant pages
  const useEnhancedLayout =
    router.pathname === "/" ||
    router.pathname.startsWith("/product") ||
    router.pathname.startsWith("/category") ||
    router.pathname.startsWith("/brand") ||
    router.pathname.startsWith("/search") ||
    router.pathname.startsWith("/final-discovery") ||
    router.pathname.startsWith("/discovery");

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <div className={`${geistSans.variable} ${geistMono.variable}`}> 
        <Toaster position="top-center" />
        <ErrorBoundary>
            <ThemeProvider>
              <ApolloProvider>
              {useEnhancedLayout ? (
                <EnhancedLayout>
                  {/* <ApiUrlDebug /> */}
                  {/* <GraphQLErrorHandler /> */}
                  <ErrorBoundary>
                    <Component {...pageProps} />
                  </ErrorBoundary>
                </EnhancedLayout>
              ) : (
                <Layout>
                  {/* <ApiUrlDebug /> */}
                  {/* <GraphQLErrorHandler /> */}
                  <ErrorBoundary>
                    <Component {...pageProps} />
                  </ErrorBoundary>
                </Layout>
              )}
            </ApolloProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </div>
    </ClerkProvider>
  );
}
