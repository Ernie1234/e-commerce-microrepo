import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api/axiosInstance';

interface VerifyOtpArgs {
  email: string;
  otp: string;
  name: string;
  password: string;
}

/**
 * Async function to make the API call for OTP verification.
 * @param {VerifyOtpArgs} data - The email and OTP to verify.
 * @returns {Promise<any>} The response data from the API.
 */
const verifyOtp = async (data: VerifyOtpArgs) => {
  // Example endpoint: adjust to your actual OTP verification endpoint
  const response = await api.post('/auth/api/v1/verify-user', data);
  return response.data;
};

/**
 * Custom hook for handling OTP verification mutations.
 * @returns {object} The mutation object from TanStack Query's useMutation.
 */
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      console.log('OTP verified successfully:', data);
    },
    onError: (error) => {
      console.error('OTP verification failed:', error);
    },
  });
};
