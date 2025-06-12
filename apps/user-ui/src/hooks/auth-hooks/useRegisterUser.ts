import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api/axiosInstance';

interface RegisterUserArgs {
  name: string;
  email: string;
  password: string;
}
/**
 * Async function to make the API call for user registration.
 * It takes the user data and sends it to the registration endpoint.
 * @param {RegisterUserArgs} data - The user's registration data (name, email, password).
 * @returns {Promise<any>} The response data from the API.
 */

const registerUser = async (data: RegisterUserArgs) => {
  const response = await api.post('/auth/api/v1/user-registration', data);
  return response.data;
};

/**
 * Custom hook for handling user registration mutations.
 * Provides `mutate` function to trigger the registration, and states like `isPending`, `isSuccess`, `isError`, `error`.
 * @returns {object} The mutation object from TanStack Query's useMutation.
 */
export const useRegisterUser = () => {
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data, variables, context) => {
      console.log('User registered successfully:', data);
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
};
