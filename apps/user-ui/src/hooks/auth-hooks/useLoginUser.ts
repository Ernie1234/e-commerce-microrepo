import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api/axiosInstance';

// Define the interface for the data required by the login mutation
interface LoginUserArgs {
  email: string;
  password: string;
}

/**
 * Async function to make the API call for user login.
 * @param {LoginUserArgs} data - The user's login credentials (email, password).
 * @returns {Promise<any>} The response data from the API.
 */
const loginUser = async (data: LoginUserArgs) => {
  const response = await api.post('/auth/api/v1/login-user', data);
  return response.data;
};

/**
 * Custom hook for handling user login mutations.
 * Provides `mutate` function to trigger the login, and states like `isPending`, `isSuccess`, `isError`, `error`.
 * @returns {object} The mutation object from TanStack Query's useMutation.
 */
export const useLoginUser = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log('User logged in successfully:', data);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};
