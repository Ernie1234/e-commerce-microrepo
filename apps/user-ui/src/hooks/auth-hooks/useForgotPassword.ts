import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api/axiosInstance';

// Define the interface for the data required by the login mutation
interface ForgotPasswordUserArgs {
  email: string;
}

/**
 * Async function to make the API call for user login.
 * @param {ForgotPasswordUserArgs} data - The user's login credentials (email, password).
 * @returns {Promise<any>} The response data from the API.
 */
const userForgotPassword = async (data: ForgotPasswordUserArgs) => {
  const response = await api.post('/auth/api/v1/user-forgot-password', data);
  return response.data;
};

/**
 * Custom hook for handling user login mutations.
 * Provides `mutate` function to trigger the login, and states like `isPending`, `isSuccess`, `isError`, `error`.
 * @returns {object} The mutation object from TanStack Query's useMutation.
 */
export const useUserForgotPassword = () => {
  return useMutation({
    mutationFn: userForgotPassword,
    onSuccess: (data) => {
      console.log('User logged in successfully:', data);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};
