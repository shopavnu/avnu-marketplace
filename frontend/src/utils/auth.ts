/**
 * Get the authentication header for API requests
 * @returns Authentication header object or empty object if not authenticated
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    return {
      Authorization: `Bearer ${token}`
    };
  }
  
  return {};
};
