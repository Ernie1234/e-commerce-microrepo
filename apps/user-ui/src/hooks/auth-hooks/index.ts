import { useRegisterUser } from './useRegisterUser';
import { useResendOtp } from './useResendOtp';
import { useVerifyOtp } from './useVerifyOtp';
import { useLoginUser } from './useLoginUser';
import { useUserForgotPassword } from './useForgotPassword';
import { useVerifyUserForgotPassword } from './useVerifyUserForgotPassword';
import { useResetUserPassword } from './useResetUserPassword';

interface AuthHooks {
  useRegisterUser: typeof useRegisterUser;
  useResendOtp: typeof useResendOtp;
  useVerifyOtp: typeof useVerifyOtp;
  useLoginUser: typeof useLoginUser;
  useUserForgotPassword: typeof useUserForgotPassword;
  useVerifyUserForgotPassword: typeof useVerifyUserForgotPassword;
  useResetUserPassword: typeof useResetUserPassword;
}

const authHooks: AuthHooks = {
  useRegisterUser,
  useResendOtp,
  useVerifyOtp,
  useLoginUser,
  useUserForgotPassword,
  useVerifyUserForgotPassword,
  useResetUserPassword,
};

export default authHooks;
