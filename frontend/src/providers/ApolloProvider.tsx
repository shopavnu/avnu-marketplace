import { ApolloProvider as BaseApolloProvider } from "@apollo/client";
import apolloClient from "../lib/apollo-client";

type ApolloProviderProps = {
  children: React.ReactNode;
};

export default function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <BaseApolloProvider client={apolloClient}>{children}</BaseApolloProvider>
  );
}
