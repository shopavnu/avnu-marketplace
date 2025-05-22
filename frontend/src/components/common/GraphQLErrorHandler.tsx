import React from "react";
import { useQuery, gql } from "@apollo/client";

// A minimal query to test the GraphQL connection
const TEST_QUERY = gql`
  query TestQuery {
    __typename
  }
`;

// Component to handle Apollo errors more gracefully
const GraphQLErrorHandler: React.FC = () => {
  // Run a test query to check connection
  const { loading, error } = useQuery(TEST_QUERY, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  // Only show if there's an error
  if (!error) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 p-4 border-t-2 border-yellow-300 z-50">
      <div className="container mx-auto">
        <h3 className="text-lg font-semibold text-yellow-800">
          GraphQL Connection Issue
        </h3>
        <p className="text-yellow-700 mb-2">
          The app is having trouble connecting to the API. Some features may not
          work correctly.
        </p>
        <details className="text-sm">
          <summary className="cursor-pointer text-yellow-600 hover:text-yellow-800">
            Technical Details
          </summary>
          <pre className="mt-2 p-2 bg-yellow-50 text-xs overflow-auto max-h-40 rounded">
            {error.message}
          </pre>
        </details>
        <p className="text-sm text-yellow-600 mt-2">
          This is a demo environment - you can continue using the app with mock
          data.
        </p>
      </div>
    </div>
  );
};

export default GraphQLErrorHandler;
