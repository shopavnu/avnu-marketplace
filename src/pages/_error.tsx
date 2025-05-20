import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

interface ErrorProps {
  statusCode: number;
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Head>
        <title>Error {statusCode} | Avnu Marketplace</title>
      </Head>
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
        <h1 className="text-4xl font-bold text-charcoal mb-2">
          {statusCode ? `Error ${statusCode}` : 'An error occurred'}
        </h1>
        <p className="text-lg text-neutral-gray mb-6">
          {statusCode === 404
            ? "We couldn't find the page you were looking for."
            : "We're sorry, something went wrong on our end."}
        </p>
        <Link 
          href="/" 
          className="inline-block px-6 py-3 bg-sage text-white font-medium rounded-lg transition-colors duration-200 hover:bg-sage/90"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
