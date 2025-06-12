import { useRegisterUser } from './useRegisterUser';
import { useResendOtp } from './useResendOtp';
import { useVerifyOtp } from './useVerifyOtp';

interface AuthHooks {
  useRegisterUser: typeof useRegisterUser;
  useResendOtp: typeof useResendOtp;
  useVerifyOtp: typeof useVerifyOtp;
}

const authHooks: AuthHooks = {
  useRegisterUser,
  useResendOtp,
  useVerifyOtp,
};

export default authHooks;
