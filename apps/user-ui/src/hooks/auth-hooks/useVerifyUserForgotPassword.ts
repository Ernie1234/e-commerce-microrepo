import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api/axiosInstance';

// Define the interface for the data required by the login mutation
interface verifyUserForgotPasswordArgs {
  email: string;
  otp: string;
}

/**
 * Async function to make the API call for user login.
 * @param {verifyUserForgotPasswordArgs} data - The user's login credentials (email, password).
 * @returns {Promise<any>} The response data from the API.
 */
const verifryUserForgotPassword = async (
  data: verifyUserForgotPasswordArgs
) => {
  const response = await api.post(
    '/auth/api/v1/user-verify-forgot-password',
    data
  );
  return response.data;
};

/**
 * Custom hook for handling user login mutations.
 * Provides `mutate` function to trigger the login, and states like `isPending`, `isSuccess`, `isError`, `error`.
 * @returns {object} The mutation object from TanStack Query's useMutation.
 */
export const useVerifyUserForgotPassword = () => {
  return useMutation({
    mutationFn: verifryUserForgotPassword,
    onSuccess: (data) => {
      console.log('User Otp verify successfully:', data);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};
