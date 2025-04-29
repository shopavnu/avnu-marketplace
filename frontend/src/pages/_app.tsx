import '../styles/globals.css';
import '../styles/product-card.css'; // Import product card consistent styling
import type { AppProps } from 'next/app';
import ApolloProvider from '../providers/ApolloProvider';
import { Layout, EnhancedLayout } from '../components/layout';
import ApiUrlDebug from '../components/debug/ApiUrlDebug';
import ErrorBoundary from '../components/common/ErrorBoundary';
import GraphQLErrorHandler from '../components/common/GraphQLErrorHandler';
import { useRouter } from 'next/router';
import { ThemeProvider } from '../context/ThemeContext';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Use EnhancedLayout for the homepage and product pages, regular Layout for admin/merchant pages
  const useEnhancedLayout = (
    router.pathname === '/' || 
    router.pathname.startsWith('/product') ||
    router.pathname.startsWith('/category') ||
    router.pathname.startsWith('/brand') ||
    router.pathname.startsWith('/search')
  );
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ApolloProvider>
        {useEnhancedLayout ? (
          <EnhancedLayout>
            <ApiUrlDebug />
            <GraphQLErrorHandler />
            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>
          </EnhancedLayout>
        ) : (
          <Layout>
            <ApiUrlDebug />
            <GraphQLErrorHandler />
            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>
          </Layout>
        )}
        </ApolloProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
