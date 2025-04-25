import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/layout/Layout';
import ApolloProvider from '@/providers/ApolloProvider';
import ApiUrlDebug from '@/components/debug/ApiUrlDebug';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider>
      <Layout>
        <Component {...pageProps} />
        <ApiUrlDebug />
      </Layout>
    </ApolloProvider>
  );
}
