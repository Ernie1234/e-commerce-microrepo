import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api/axiosInstance';

interface ResendOtpArgs {
  email: string; // Assuming email is needed to specify which user to resend OTP for
}

/**
 * Async function to make the API call for resending OTP.
 * @param {ResendOtpArgs} data - The email for which to resend OTP.
 * @returns {Promise<any>} The response data from the API.
 */
const resendOtp = async (data: ResendOtpArgs) => {
  // Example endpoint: adjust to your actual resend OTP endpoint
  const response = await api.post('/auth/api/v1/resend-otp', data);
  return response.data;
};

/**
 * Custom hook for handling resend OTP mutations.
 * @returns {object} The mutation object from TanStack Query's useMutation.
 */
export const useResendOtp = () => {
  return useMutation({
    mutationFn: resendOtp,
    onSuccess: (data) => {
      console.log('OTP resent successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to resend OTP:', error);
    },
  });
};
