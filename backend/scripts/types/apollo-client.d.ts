declare module '@apollo/client' {
  export function gql(template: TemplateStringsArray, ...expressions: any[]): any;
  export function useQuery(query: any, options?: any): {
    loading: boolean;
    error?: Error;
    data?: any;
    refetch: (variables?: any) => Promise<any>;
  };
  export function useMutation(mutation: any, options?: any): [
    (variables?: any) => Promise<any>,
    {
      loading: boolean;
      error?: Error;
      data?: any;
    }
  ];
  export function useSubscription(subscription: any, options?: any): {
    loading: boolean;
    error?: Error;
    data?: any;
  };
  export class ApolloClient {
    constructor(options: any);
    query(options: any): Promise<any>;
    mutate(options: any): Promise<any>;
  }
  export class InMemoryCache {
    constructor(options?: any);
  }
  export const ApolloProvider: React.ComponentType<{
    client: ApolloClient<any>;
    children: React.ReactNode;
  }>;
}
