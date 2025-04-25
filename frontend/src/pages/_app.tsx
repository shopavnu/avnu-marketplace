import '../styles/globals.css';
import type { AppProps } from 'next/app';
import ApolloProvider from '../providers/ApolloProvider';
import { Layout } from '../components/layout';
import ApiUrlDebug from '../components/debug/ApiUrlDebug';
import ErrorBoundary from '../components/common/ErrorBoundary';
import GraphQLErrorHandler from '../components/common/GraphQLErrorHandler';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ApolloProvider>
        <Layout>
          <ApiUrlDebug />
          <GraphQLErrorHandler />
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        </Layout>
      </ApolloProvider>
    </ErrorBoundary>
  );
}
